// src/services/authService.js
import API from "../utils/api";

export const registerUser = async (formData) => {
  const res = await API.post("/auth/register", formData);
  return res.data;
};

export const loginUser = async (formData) => {
  const res = await API.post("/auth/login", formData);
  return res.data;
};
