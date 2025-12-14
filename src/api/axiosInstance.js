// src/api/axiosInstance.js
import axios from "axios";

// En Vite, las variables deben empezar con VITE_
const API_URL = import.meta.env.VITE_API_URL;

// Normaliza para evitar "////"
const normalized = (API_URL || "").replace(/\/+$/, "");

// Si no existe la variable, usa localhost (solo para desarrollo)
const baseURL = normalized
  ? `${normalized}/api`
  : "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true, // déjalo true si usas cookies/sesión
});

export default api;
