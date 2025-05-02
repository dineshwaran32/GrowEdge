import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Resume from './pages/Resume';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainLayout from './layouts/mainLayout';
import AuthLayout from './layouts/authLayout';

function App() {
  return (
    <Router>
     
      <Routes>
        <Route element={<MainLayout/>}>
        <Route path="/home" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<AuthLayout/>}>
      <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        </Route>
        </Routes>
    </Router>
  );
}

export default App;
