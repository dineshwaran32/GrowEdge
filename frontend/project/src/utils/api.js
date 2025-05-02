// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ This should match your backend URL
});

export default API;
