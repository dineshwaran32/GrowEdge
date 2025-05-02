import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

function cleanResumeText(resumeText) {
  return resumeText
    .replace(/Name:.*\n?/gi, '')
    .replace(/Contact:.*\n?/gi, '')
    .replace(/Objective[\s\S]*?(?=\n[A-Z]|$)/gi, '')
    .trim();
}

async function generateInterviewQuestions(skills, resumeText) {
  if (!skills || skills.length === 0) {
    console.error('❌ No skills provided for question generation');
    throw new Error('No skills found in resume');
  }

  const cleanedText = cleanResumeText(resumeText);
  console.log('📄 Processing skills:', skills.join(', '));

  // More specific prompt with formatting instructions
  const prompt = `Generate ${skills.length * 2} interview questions based on these skills: ${skills.join(', ')}. 
Format each question exactly like this:
1. [Your question about first skill]
2. [Your question about second skill]
etc.

Requirements:
- Questions should be technical and specific
- Mix theoretical and practical questions
- One line per question
- No extra text or formatting`;

  try {
    console.log('🔄 Sending request to DeepSeek API...');
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:5000',
        'X-Title': 'Interview Question Generator'
      }
    });

    // Validate API response
    if (!response.data) {
      console.error('❌ Empty response from API');
      throw new Error('Empty response from API');
    }

    if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error('❌ Invalid response structure:', response.data);
      throw new Error('Invalid response structure from API');
    }

    const content = response.data.choices[0].message.content;
    if (!content) {
      console.error('❌ Empty content in API response');
      throw new Error('Empty content in API response');
    }

    console.log('✅ Raw API response received:', content);

    // Process questions - handle both numbered and Q prefixed formats
    let questions = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && (line.match(/^\d+\./) || line.match(/^Q\d+\./)))
      .map(line => line.replace(/^(\d+|Q\d+)\.?\s*/, '').trim())
      .filter(q => q.length > 10);

    if (questions.length === 0) {
      console.error('❌ No valid questions extracted from response');
      throw new Error('No valid questions could be extracted from the API response');
    }

    console.log(`✅ Successfully extracted ${questions.length} questions`);

    // Ensure minimum number of questions
    while (questions.length < skills.length) {
      const skill = skills[questions.length % skills.length];
      questions.push(`Explain a practical application of ${skill} in a real-world project.`);
    }

    return questions;

  } catch (err) {
    console.error('❌ Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    if (err.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }
    
    throw new Error(`Question generation failed: ${err.message}`);
  }
}

export default generateInterviewQuestions;
