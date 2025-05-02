import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import Result from '../models/InterviewResults.mjs';
import authMiddleware from '../middleware/auth.mjs';

dotenv.config();

const router = express.Router();

router.post('/generate', async (req, res) => {
  console.log('[LOG] POST request received at /api/questions/generate');

  const { topic, difficulty } = req.body;

  const prompt = `Generate 5 ${difficulty} level interview questions about ${topic}. Each question should be clear and specific. Format your response exactly as shown:
Q1. Write your first question here
Q2. Write your second question here
Q3. Write your third question here
Q4. Write your fourth question here
Q5. Write your fifth question here`;

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7, // Add some creativity but keep it focused
      max_tokens: 1000  // Ensure we get complete responses
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let questions = response.data.choices[0].message.content.trim();
    
    // Clean up the response
    if (!questions.includes('Q1.')) {
      // If questions aren't properly formatted, try to format them
      questions = questions.split('\n')
        .filter(line => line.trim())
        .map((line, index) => `Q${index + 1}. ${line.replace(/^\d+\.\s*/, '')}`)
        .join('\n');
    }

    // Validate that we have questions in the correct format
    if (!questions.match(/Q1\./)) {
      throw new Error('Invalid question format received from API');
    }

    console.log('[LOG] Generated questions:', questions);
    res.json({ questions });
  } catch (error) {
    console.error('[ERROR] Error generating questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: 'Please try again. If the problem persists, try a different topic or difficulty level.'
    });
  }
});

router.post('/evaluate', authMiddleware, async (req, res) => {
  console.log('[LOG] POST request received at /api/questions/evaluate');

  const { questions, answers, email, topic, difficulty } = req.body;

  // Validate all required fields
  if (!questions || !answers || !email || !topic || !difficulty) {
    console.error('[ERROR] Missing required fields:', { questions: !!questions, answers: !!answers, email: !!email, topic: !!topic, difficulty: !!difficulty });
    return res.status(400).json({ error: 'Missing required fields. Please provide questions, answers, email, topic, and difficulty.' });
  }

  if (questions.length !== answers.length) {
    console.error('[ERROR] Questions and answers length mismatch:', { questionsLength: questions.length, answersLength: answers.length });
    return res.status(400).json({ error: 'Number of questions and answers must match' });
  }

  try {
    const evaluations = [];
    let totalScore = 0;
    const confidenceLevels = [];

    for (let i = 0; i < questions.length; i++) {
      const userAnswer = answers[i]?.trim();

      if (!userAnswer) {
        console.log(`[INFO] Q${i + 1} has no answer. Skipping API call.`);
        evaluations.push({
          feedback: 'No answer provided.',
          score: 0,
          confidence: 'low'
        });
        confidenceLevels.push('low');
        continue;
      }

      const prompt = `
You are an expert evaluator. Grade the following answer based on correctness, clarity, and relevance.
Also assess the confidence level in the answer.
Respond in exactly the following format (no extra text):
Feedback: <write a short feedback sentence>
Score: <only a number from 0 to 10>
Confidence: <low/medium/high based on how confident and assertive the answer is>

Question: ${questions[i]}
Answer: ${userAnswer}`;

      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const text = response.data.choices[0].message.content.trim();
      console.log(`[DEBUG] DeepSeek response for Q${i + 1}:\n${text}`);

      const feedbackMatch = text.match(/Feedback\s*:\s*(.*)/i);
      const scoreMatch = text.match(/Score\s*:\s*(\d+)/i);
      const confidenceMatch = text.match(/Confidence\s*:\s*(low|medium|high)/i);

      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback provided.';
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const confidence = confidenceMatch ? confidenceMatch[1].toLowerCase() : 'low';

      confidenceLevels.push(confidence);

      if (isNaN(score)) {
        console.warn(`[WARNING] Score parsing failed for Q${i + 1}, setting score to 0.`);
      }

      totalScore += score;

      evaluations.push({
        feedback,
        score: isNaN(score) ? 0 : score,
        confidence
      });

      console.log(`[EVALUATION] Q${i + 1}: Score = ${score} | Confidence = ${confidence} | Feedback = ${feedback}`);
    }
    console.log(`[LOG] Total Score: ${totalScore}`);

    const averageScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;
    console.log(`[RESULT] Average Score: ${averageScore}`);

    const confidenceValues = { low: 1, medium: 2, high: 3 };
    const avgConfidenceScore = confidenceLevels.reduce((sum, conf) => sum + confidenceValues[conf], 0) / confidenceLevels.length;
    const averageConfidence = avgConfidenceScore <= 1.5 ? 'low' : avgConfidenceScore <= 2.5 ? 'medium' : 'high';

    try {
      const newResult = new Result({
        userId: req.user,
        email,
        topic,
        difficulty,
        score: totalScore,
        confidenceLevels,
        averageConfidence,
        date: new Date(),
      });

      const savedResult = await newResult.save();
      console.log(`[DB] Result saved for ${email}:`, savedResult);
    } catch (dbError) {
      console.error('[ERROR] Failed to save result to database:', dbError);
    }

    res.json({ 
      evaluations, 
      score: totalScore,
      averageScore,
      totalPossible: questions.length * 10,
      confidenceLevels,
      averageConfidence,
      email,
      topic,
      difficulty
    });

  } catch (error) {
    console.error('❌ Error evaluating answers:', error);
    res.status(500).json({ error: 'Failed to evaluate answers' });
  }
});

router.post('/save', authMiddleware, async (req, res) => {
  const { email, topic, difficulty, score } = req.body;

  try {
    const result = new Result({
      userId: req.user, 
      email,
      topic,
      difficulty,
      score,
      date: new Date(),
    });
    await result.save();
    console.log(`[DB] Result saved for ${email}`);
    res.json({ message: 'Result saved successfully' });
  } catch (error) {
    console.error('❌ Error saving result:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user })
      .sort({ date: -1 })
      .select('topic score difficulty date');
    
    // Group results by topic
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.topic]) {
        acc[result.topic] = [];
      }
      acc[result.topic].push({
        score: result.score,
        difficulty: result.difficulty,
        date: result.date
      });
      return acc;
    }, {});

    res.json(groupedResults);
  } catch (error) {
    console.error('[ERROR] Failed to fetch interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

export default router;
