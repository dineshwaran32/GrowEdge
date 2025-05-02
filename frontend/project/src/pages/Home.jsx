
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import growEdgeImage from "../assets/img1.png"; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="home-left">
        <h1 className="home-title">Welcome to <span>GrowEdge</span> 👋</h1>
        <p className="home-desc">
          Your personal AI-powered smart interview coach.  
          Practice interviews, track your progress, upload resumes, and get real-time feedback — all in one place.
        </p>

        <div className="home-buttons">
        <div className="home-buttons">
  <div className="card-button" onClick={() => navigate('/interview')}>Mock Interview</div>
  <div className="card-button" onClick={() => navigate('/resume')}>Resume Scanner</div>
  <div className="card-button" onClick={() => navigate('/tasks')}>Task Scheduler</div>
  <div className="card-button" onClick={() => navigate('/profile')}>View Profile</div>
</div>

        </div>

        <div className="tip-box">
          💡 <strong>Tip of the Day:</strong> “Confidence comes from preparation. Prepare smart!”
        </div>
      </div>

      <div className="home-right">
        <img src={growEdgeImage} alt="GrowEdge Logo" />
      </div>
    </div>
  );
};

export default Home;
