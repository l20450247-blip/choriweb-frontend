// src/api/auth.js
import api from "./axiosInstance";

// Registrar usuario
export const registerRequest = (data) => api.post("/auth/register", data);

// Iniciar sesión
export const loginRequest = (data) => api.post("/auth/login", data);

// Cerrar sesión
export const logoutRequest = () => api.post("/auth/logout");

// Verificar sesión / token (si lo tienes en tu backend)
export const verifyTokenRequest = () => api.get("/auth/verify");
