import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar-container">
      <div className="navbar-logo">GrowEdge</div>
      <ul className="navbar-links">
        <li><NavLink to="/home" activeclassname="active">Home</NavLink></li>
        <li><NavLink to="/interview" activeclassname="active">Mock Interview</NavLink></li>
        <li><NavLink to="/resume" activeclassname="active">Resume Scan</NavLink></li>
        <li><NavLink to="/tasks" activeclassname="active">Task Manager</NavLink></li>
        <li><NavLink to="/profile" activeclassname="active">Profile</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navbar;
