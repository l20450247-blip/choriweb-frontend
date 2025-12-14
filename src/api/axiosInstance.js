// src/api/axiosInstance.js
import axios from "axios";

//  Vercel usa esta variable
const API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

// fallback SOLO para desarrollo local
const baseURL = API_URL
  ? `${API_URL}/api`
  : "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
