// src/api/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

// VITE_API_URL = https://choriweb-backend.onrender.com
const RAW = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW.trim().replace(/\/+$/, ""); // quita slash final

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // lo dejamos por si el backend usa cookies, pero YA NO dependemos de eso
});

//  Interceptor: manda token en Authorization si existe en cookie del FRONT
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
