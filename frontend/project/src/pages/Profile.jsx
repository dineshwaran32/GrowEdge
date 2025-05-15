import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import API from '../services/axios';
import './Profile.css';

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

const Profile = () => {
  const [userEmail, setUserEmail] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      fetchInterviewHistory();
    }
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Auth token exists:', !!token);
      
      console.log('Fetching interview history...');
      const response = await API.get('/questions/history');
      console.log('Interview history response:', response);
      console.log('Interview history response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if (Object.keys(response.data).length === 0) {
          console.log('No interview history data received');
        } else {
          console.log('Received interview history for topics:', Object.keys(response.data));
        }
        setInterviewHistory(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setInterviewHistory({});
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please log in again.');
        navigate('/login');
      } else {
        console.error('Failed to fetch interview history:', error.response || error);
      }
      setInterviewHistory({});
    }
  };

  const renderScoreChart = (interview) => {
    const data = {
      labels: interview.questions.map((_, idx) => `Q${idx + 1}`),
      datasets: [
        {
          label: 'Question Scores',
          data: interview.evaluations.map(e => e.score),
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

  const renderConfidenceChart = (interview) => {
    const confidenceCounts = {
      low: interview.evaluations.filter(e => e.confidence === 'low').length,
      medium: interview.evaluations.filter(e => e.confidence === 'medium').length,
      high: interview.evaluations.filter(e => e.confidence === 'high').length,
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

  const renderHistoryChart = () => {
    if (typeof interviewHistory !== 'object' || !interviewHistory) return null;

    const groupedData = interviewHistory;

    if (Object.keys(groupedData).length === 0) return null;

    const datasets = Object.entries(groupedData).map(([topic, interviews]) => {
      const color = getRandomColor(topic);
      return {
        label: `${topic} (${interviews.length} attempts)`,
        data: interviews.map(i => i.score),
        borderColor: color,
        backgroundColor: getRandomColor(topic, 0.5),
        tension: 0.1,
        pointStyle: interviews.map(i => 
          i.difficulty === 'Hard' ? 'triangle' : 
          i.difficulty === 'Medium' ? 'circle' : 'rect'
        ),
        pointRadius: 6,
        pointHoverRadius: 8
      };
    });

    const MAX_VISIBLE_ATTEMPTS = 10;
    const maxAttempts = Math.min(
      Math.max(...Object.values(groupedData).map(g => g.length)),
      MAX_VISIBLE_ATTEMPTS
    );

    const limitedDatasets = datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(-MAX_VISIBLE_ATTEMPTS),
      pointStyle: dataset.pointStyle?.slice(-MAX_VISIBLE_ATTEMPTS),
      difficulty: dataset.difficulty?.slice(-MAX_VISIBLE_ATTEMPTS)
    }));

    // Calculate the maximum score across all datasets
    const allScores = limitedDatasets.flatMap(dataset => dataset.data);
    const maxScore = Math.max(...allScores);
    // Round up to the nearest 10 for a clean maximum
    const yAxisMax = Math.ceil(maxScore / 10) * 10;
    // Set a reasonable step size based on the maximum score
    const stepSize = Math.max(5, Math.ceil(yAxisMax / 10));

    const data = {
      labels: Array.from({ length: maxAttempts }, (_, i) => `Attempt ${i + 1}`),
      datasets: limitedDatasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { 
            color: 'white',
            padding: 20,
            font: { size: 12 },
            boxWidth: 15,
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: 'Progress Over Time',
          color: 'white',
          font: { size: 16, weight: 'bold' },
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
          padding: 15,
          displayColors: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: yAxisMax, // Dynamically set the maximum based on data
          min: 0,
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: { size: 12 },
            stepSize: stepSize, // Dynamically set step size
            padding: 8
          }
        },
        x: {
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { 
            color: 'white',
            font: { size: 10 },
            padding: 5,
            maxRotation: 30,
            minRotation: 30
          }
        }
      },
      layout: {
        padding: {
          left: 15,
          right: 15,
          top: 20,
          bottom: 15
        }
      },
      elements: {
        line: {
          tension: 0.3,
          borderWidth: 2
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2
        }
      }
    };

    return (
      <div className="history-chart-wrapper">
        <Line data={data} options={options} height={300} />
      </div>
    );
  };

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
    
    const lowerSeed = seed.toLowerCase();
    if (colors[lowerSeed]) {
      return colors[lowerSeed];
    }
    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsla(${h}, 70%, 50%, ${alpha})`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-container">
      <h2>Interview History</h2>

      <div className="chart-section">
        <h3>Overall Progress</h3>
        {renderHistoryChart()}
      </div>

      <div className="interviews-list">
        <h3>Past Interviews</h3>
        {interviewHistory && Object.keys(interviewHistory).length > 0 ? (
          Object.entries(interviewHistory).map(([topic, interviews]) => (
            <div key={topic} className="topic-group">
              <h4>{topic}</h4>
              {interviews.map((interview, index) => (
                <div 
                  key={index} 
                  className={`interview-card ${selectedInterview === interview ? 'selected' : ''}`}
                  onClick={() => setSelectedInterview(interview)}
                >
                  <div className="interview-header">
                    <span className="date">{formatDate(interview.date)}</span>
                    <span className={`difficulty ${interview.difficulty.toLowerCase()}`}>
                      {interview.difficulty}
                    </span>
                  </div>
                  <div className="interview-stats">
                    <span>Score: {interview.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No interview history available.</p>
        )}
      </div>

      {selectedInterview && (
        <div className="interview-details">
          <h3>Interview Details</h3>
          <div className="interview-header">
            <h4>{selectedInterview.topic} - {selectedInterview.difficulty}</h4>
            <span className="date">{formatDate(selectedInterview.date)}</span>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              {renderScoreChart(selectedInterview)}
            </div>
            <div className="chart-wrapper">
              {renderConfidenceChart(selectedInterview)}
            </div>
          </div>

          <div className="questions-review">
            {selectedInterview.questions.map((q, index) => (
              <div key={index} className="question-item">
                <p><strong>Q{index + 1}:</strong> {q}</p>
                <p><strong>Your Answer:</strong> {selectedInterview.answers[index]}</p>
                <p><strong>Feedback:</strong> {selectedInterview.evaluations[index]?.feedback || "Not available"}</p>
                <p><strong>Score:</strong> {selectedInterview.evaluations[index]?.score ?? "-"} / 10</p>
                <p><strong>Confidence Level:</strong> {selectedInterview.evaluations[index]?.confidence || "Not available"}</p>
                <hr />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;