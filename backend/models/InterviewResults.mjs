import mongoose from 'mongoose'; // 🔥 Don't forget this line!

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  confidenceLevels: [{
    type: String,
    enum: ['low', 'medium', 'high']
  }],
  averageConfidence: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// 👇 Create and export the model
const Result = mongoose.model('InterviewResult', resultSchema);
export default Result;
