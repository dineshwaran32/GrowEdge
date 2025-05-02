import API from './axios'; // Adjust the path if needed

const saveInterviewResult = async ({ email, topic, difficulty, score }) => {
  try {
    // No need to manually set Authorization header since it's handled by axios interceptor in axios.js
    const response = await API.post('/questions/save', {
      email,
      topic,
      difficulty,
      score,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving result:", error.response?.data || error.message);
    throw error;
  }
};

export default saveInterviewResult;
