import React, { useState } from "react";
import "./Resume.css";
import API from "../services/axios";

const Resume = () => {
  const [questions, setQuestions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateQuestions = async () => {
    if (!file) {
      alert("Please upload a resume file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await API.post("/resume/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Check if we have questions in the response
      if (response.data.data && response.data.data.InterviewQuestions) {
        setQuestions(response.data.data.InterviewQuestions);
      } else {
        console.error('No questions in response:', response.data);
        throw new Error('No questions received');
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      alert("Failed to generate questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-scanner-container">
      <div className="upload-section">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="upload-button"
        />
        <button className="generate-btn" onClick={handleGenerateQuestions}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      <div className="questions-box">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <p key={index} className="question-item">
              {index + 1}. {q}
            </p>
          ))
        ) : (
          <p className="placeholder-text">Questions will appear here</p>
        )}
      </div>
    </div>
  );
};

export default Resume;
