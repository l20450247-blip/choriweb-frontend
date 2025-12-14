// src/api/auth.js
import api from "./axiosInstance";

// Registro
export const registerRequest = (data) => api.post("/auth/register", data);

// Login
export const loginRequest = (data) => api.post("/auth/login", data);

// Cerrar sesión
export const logoutRequest = () => api.post("/auth/logout");

// Verificar sesión / token (si tienes ese endpoint)
export const verifyTokenRequest = () => api.get("/auth/verify");

// Perfil (si lo tienes)
export const profileRequest = () => api.get("/auth/profile");
