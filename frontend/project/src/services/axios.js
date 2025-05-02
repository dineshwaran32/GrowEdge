import axios from "axios";

// Create an axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add a request interceptor to include token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, attach it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export default API;
