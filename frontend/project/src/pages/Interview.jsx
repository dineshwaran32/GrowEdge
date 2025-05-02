// src/pages/Interview.jsx
import React, { useState, useEffect } from "react";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import "./Interview.css";
import saveInterviewResult from "../services/saveResults";
import API from "../services/axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Interview = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [historyData, setHistoryData] = useState({});

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    if (interviewSubmitted) {
      fetchInterviewHistory();
    }
  }, [interviewSubmitted]);

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

  const fetchInterviewHistory = async () => {
    try {
      const response = await API.get('/questions/history');
      setHistoryData(response.data);
    } catch (error) {
      console.error('Failed to fetch interview history:', error);
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

      const data = response.data;
      setEvaluations(data.evaluations);
      setScore(data.score);
      setInterviewSubmitted(true);
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Something went wrong during evaluation. Please try again.");
    }
  };

  const handleSaveResult = async () => {
    if (!userEmail) {
      alert("User not logged in");
      return;
    }

    try {
      await saveInterviewResult({ email: userEmail, topic, difficulty, score });
      alert("✅ Result saved successfully!");
    } catch (error) {
      console.error("Saving error:", error);
      alert("❌ Failed to save result.");
    }
  };

  const renderScoreChart = () => {
    const currentScores = evaluations.map(e => e.score);

    const data = {
      labels: questions.map((_, idx) => `Q${idx + 1}`),
      datasets: [
        {
          label: 'Current Score',
          data: currentScores,
          backgroundColor: 'rgba(91, 192, 235, 0.7)',
          borderColor: 'rgb(91, 192, 235)',
          borderWidth: 1,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { 
            color: 'white',
            padding: 15,
            font: { size: 13 }
          }
        },
        title: {
          display: true,
          text: 'Question Scores',
          color: 'white',
          font: { size: 16, weight: 'bold' },
          padding: { top: 10, bottom: 20 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: { size: 12 },
            padding: 5
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: { size: 12 },
            padding: 5
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryChart = () => {
    const topics = Object.keys(historyData);
    if (!topics.includes(topic)) {
      topics.push(topic);
    }

    const datasets = topics.map((topicName) => {
      const topicData = historyData[topicName] || [];
      const scores = topicData.map(result => ({
        score: result.score / 50 * 10,
        difficulty: result.difficulty,
        date: result.date
      }));

      // Add current score if this is the current topic
      if (topicName === topic) {
        scores.push({
          score: score / questions.length,
          difficulty,
          date: new Date().toISOString()
        });
      }

      return {
        label: `${topicName} (${scores.length} attempts)`,
        data: scores.map(s => s.score),
        borderColor: getRandomColor(topicName),
        backgroundColor: getRandomColor(topicName, 0.5),
        tension: 0.1,
        pointStyle: scores.map(s => s.difficulty === 'Hard' ? 'triangle' : s.difficulty === 'Medium' ? 'circle' : 'rect'),
        pointRadius: 6,
        pointHoverRadius: 8,
        difficulty: scores.map(s => s.difficulty),
        dates: scores.map(s => s.date)
      };
    });

    const maxAttempts = Math.max(...topics.map(t => 
      (historyData[t]?.length || 0) + (t === topic ? 1 : 0)
    ));

    const data = {
      labels: Array.from({ length: maxAttempts }, (_, i) => `Attempt ${i + 1}`),
      datasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'x'
      },
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 20,
          bottom: 10
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: { 
            color: 'white',
            padding: 15,
            font: {
              size: 13
            },
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: 'Score History by Topic',
          color: 'white',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: {
              size: 12
            },
            padding: 5
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: {
              size: 12
            },
            padding: 5
          }
        }
      }
    };

    return (
      <div className="history-chart-wrapper">
        <Line data={data} options={options} />
      </div>
    );
  };

  // Helper function to generate consistent colors for topics
  const getRandomColor = (seed, alpha = 1) => {
    const colors = {
      'java': `rgba(255, 99, 132, ${alpha})`,
      'python': `rgba(75, 192, 192, ${alpha})`,
      'javascript': `rgba(255, 206, 86, ${alpha})`,
      'c': `rgba(153, 102, 255, ${alpha})`,
      'c++': `rgba(54, 162, 235, ${alpha})`,
      'react': `rgba(255, 159, 64, ${alpha})`,
      'node.js': `rgba(199, 199, 199, ${alpha})`,
      'mongodb': `rgba(83, 166, 99, ${alpha})`,
      'sql': `rgba(209, 131, 192, ${alpha})`,
      'dbms': `rgba(255, 127, 80, ${alpha})`
    };
    
    // Convert seed to lowercase for matching
    const lowerSeed = seed.toLowerCase();
    
    // Return color if it exists in our mapping
    if (colors[lowerSeed]) {
      return colors[lowerSeed];
    }
    
    // Generate a consistent color based on the seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = hash % 360;
    return `hsla(${h}, 70%, 50%, ${alpha})`;
  };

  const renderConfidenceChart = () => {
    const confidenceCounts = {
      low: evaluations.filter(e => e.confidence === 'low').length,
      medium: evaluations.filter(e => e.confidence === 'medium').length,
      high: evaluations.filter(e => e.confidence === 'high').length,
    };

    const data = {
      labels: ['Low', 'Medium', 'High'],
      datasets: [
        {
          data: [confidenceCounts.low, confidenceCounts.medium, confidenceCounts.high],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { 
            color: 'white',
            padding: 15,
            font: { size: 12 }
          }
        },
        title: {
          display: true,
          text: 'Confidence Level Distribution',
          color: 'white',
          font: { size: 13, weight: 'bold' },
          padding: { top: 10, bottom: 20 }
        }
      }
    };

    return <Doughnut data={data} options={options} />;
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
      ) : interviewSubmitted ? (
        <div className="score-board">
          <h3>🎉 Interview Completed</h3>
          <div className="interview-stats">
            <p><strong>Topic:</strong> {topic}</p>
            <p><strong>Difficulty:</strong> {difficulty}</p>
            <p><strong>Total Score:</strong> {score} / {questions.length * 10}</p>
            <p><strong>Average Score:</strong> {(score / questions.length).toFixed(2)} / 10</p>
            <p><strong>Average Confidence:</strong> {evaluations.length ? 
              (evaluations.reduce((acc, evl) => {
                const confidenceMap = { low: 1, medium: 2, high: 3 };
                return acc + confidenceMap[evl.confidence];
              }, 0) / evaluations.length).toFixed(2) + ' (1-3 scale)'
              : 'N/A'
            }</p>
          </div>

          <div className="charts-container">
            {/* History chart first - full width */}
            {Object.keys(historyData).length > 0 && (
              <div className="history-chart-wrapper">
                {renderHistoryChart()}
              </div>
            )}
            
            {/* Question scores and confidence in same row */}
            <div className="charts-row">
              <div className="chart-wrapper">
                {renderScoreChart()}
              </div>
              <div className="chart-wrapper">
                {renderConfidenceChart()}
              </div>
            </div>
          </div>

          <div className="questions-review">
            {questions.map((q, index) => (
              <div key={index} className="result-item">
                <p><strong>Q{index + 1}:</strong> {q}</p>
                <p><strong>Your Answer:</strong> {answers[index]}</p>
                <p><strong>Feedback:</strong> {evaluations[index]?.feedback || "Not available"}</p>
                <p><strong>Score:</strong> {evaluations[index]?.score ?? "-"} / 10</p>
                <p><strong>Confidence Level:</strong> {evaluations[index]?.confidence || "Not available"}</p>
                <hr />
              </div>
            ))}
          </div>
          <button onClick={handleSaveResult}>💾 Save Result</button>
        </div>
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
