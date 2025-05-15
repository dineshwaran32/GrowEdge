// src/pages/Interview.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Interview.css";
import saveInterviewResult from "../services/saveResults";
import API from "../services/axios";

const Interview = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const fetchQuestionFromBackend = async () => {
    try {
      const response = await API.post("/questions/generate", {
        topic,
        difficulty,
      });

      const data = response.data;
      if (data?.questions) {
        const questionArray = data.questions.split("\n").filter((q) => q.trim() !== "");
        setQuestions(questionArray);
        setCurrentIndex(0);
        setAnswers(Array(questionArray.length).fill(""));
      } else {
        setQuestions(["No questions received."]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions(["Failed to fetch questions."]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !difficulty) {
      alert("Fill in topic and difficulty.");
      return;
    }
    setInterviewStarted(true);
    await fetchQuestionFromBackend();
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswerText(transcript);
      setIsListening(false);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = answerText;
    setAnswers(updatedAnswers);
    setAnswerText("");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSubmitInterview = async () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = answerText;
    setAnswers(updatedAnswers);

    if (!userEmail) {
      alert("User email not found. Please login again.");
      navigate('/login');
      return;
    }

    try {
      const response = await API.post("/questions/evaluate", {
        email: userEmail,
        topic,
        difficulty,
        questions,
        answers: updatedAnswers,
      });

      // Save the interview results
      try {
        await saveInterviewResult({ 
          email: userEmail, 
          topic, 
          difficulty, 
          score: response.data.score,
          questions,
          answers: updatedAnswers,
          evaluations: response.data.evaluations,
        });
        // Show success message and redirect to profile
        alert("✅ Interview completed! Your results have been saved.");
        navigate('/profile');
      } catch (error) {
        console.error("Saving error:", error);
        alert("❌ Failed to save result. Please try again.");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Something went wrong during evaluation. Please try again.");
    }
  };

  return (
    <div className="mock-interview-container">
      <h2>Mock Interview</h2>

      {!interviewStarted ? (
        <form id="interview-form" onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="topic">Enter Topic:</label>
            <input
              type="text"
              id="topic"
              placeholder="e.g., Java, React, DBMS"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Difficulty Level:</label>
            <div className="radio-group">
              {["Easy", "Medium", "Hard"].map((level) => (
                <label key={level}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value)}
                    required
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <button type="submit">Start Interview</button>
        </form>
      ) : questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : (
        <div className="interview-session">
          <h3>Topic: {topic} | Difficulty: {difficulty}</h3>
          <div className="question-container">
            <div className="question-box">
              <p><strong>Question {currentIndex + 1}:</strong> {questions[currentIndex]}</p>
              <p><strong>Your Answer:</strong> {answerText}</p>
            </div>

            <div className="action-buttons">
              <button onClick={handleVoiceInput}>
                {isListening ? "Listening..." : "Start Voice Input"}
              </button>

              {currentIndex < questions.length - 1 ? (
                <button onClick={handleNext}>Next Question</button>
              ) : (
                <button onClick={handleSubmitInterview}>Submit Interview</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
