// src/api/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

const RAW = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = RAW.trim().replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Busca token en varias partes para evitar fallos en iPhone/Safari/PWA
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    Cookies.get("token") ||
    ""
  );
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message;

    if (
      status === 401 &&
      Array.isArray(msg) &&
      msg.some((m) => String(m).toLowerCase().includes("token"))
    ) {
      console.warn("Sesión inválida o token faltante:", msg);
    }

    return Promise.reject(error);
  }
);

export default api;