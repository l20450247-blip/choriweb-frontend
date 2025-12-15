// src/api/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

// En Vite, las variables deben empezar con VITE_
const API_URL = import.meta.env.VITE_API_URL;

// Normaliza para evitar "////"
const normalized = (API_URL || "").replace(/\/+$/, "");

// Si no existe la variable, usa localhost (solo para desarrollo)
const baseURL = normalized ? `${normalized}/api` : "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

//  En cada request, mandar el token como Authorization: Bearer ...
api.interceptors.request.use((config) => {
  const token = Cookies.get("token"); // cookie del FRONT (vercel)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
