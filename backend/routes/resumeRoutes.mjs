import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import dotenv from 'dotenv';
import extractStructuredInfo from '../utils/extractStructuredInfo.mjs';
import generateInterviewQuestions from '../utils/interviewQuestionGenerator.mjs';

dotenv.config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('resume'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please upload a resume file'
    });
  }

  try {
    // Read and parse PDF
    console.log('📄 Reading resume file...');
    const buffer = fs.readFileSync(file.path);
    const data = await pdfParse(buffer);
    const resumeText = data.text;

    // Extract skills
    console.log('🔍 Extracting skills...');
    const parsedData = extractStructuredInfo(resumeText);
    console.log('✅ Extracted Skills:', {
      HardSkills: parsedData.HardSkills,
      SoftSkills: parsedData.SoftSkills
    });

    // Validate extracted skills
    if (!parsedData.HardSkills?.length && !parsedData.SoftSkills?.length) {
      throw new Error('No skills could be extracted from the resume');
    }

    // Prioritize hard skills but include some soft skills
    const hardSkills = parsedData.HardSkills.slice(0, 4);
    const softSkills = parsedData.SoftSkills.slice(0, 2);
    const allSkills = [...hardSkills, ...softSkills];

    try {
      // Generate interview questions
      console.log('🤖 Generating questions for skills:', allSkills.join(', '));
      const questions = await generateInterviewQuestions(allSkills, resumeText);

      // Validate questions
      if (!Array.isArray(questions)) {
        throw new Error('Invalid question format received');
      }

      if (questions.length === 0) {
        throw new Error('No questions were generated');
      }

      // Clean up uploaded file
      await fs.promises.unlink(file.path);

      // Send success response
      res.json({
        status: 'success',
        data: {
          ...parsedData,
          InterviewQuestions: questions
        }
      });

    } catch (questionError) {
      console.error('❌ Question Generation Error:', questionError);
      throw new Error(`Failed to generate questions: ${questionError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Clean up file on error
    if (file && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(err => {
        console.error('Failed to delete uploaded file:', err);
      });
    }

    // Send error response with appropriate status code
    const statusCode = error.message.includes('No skills') ? 422 : 500;
    res.status(statusCode).json({
      status: 'error',
      error: 'Failed to process resume',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
