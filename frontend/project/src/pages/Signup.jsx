import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // Importing component-specific styles

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("User registered successfully");
      navigate("/home");
    } catch (error) {
      console.error(error.response.data.msg);
      alert(error.response.data.msg);
    }
  };

  return (
     <div>
        <div className="navbar-logo">GrowEdge</div>
    <div className="signup-container">
    
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-title">Signup</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
    </div>
  );
};

export default Signup;
