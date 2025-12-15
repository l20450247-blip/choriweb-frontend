// src/api/auth.js
import api from "./axiosInstance";

// Registro
export const registerRequest = (data) => api.post("/auth/register", data);

// Login
export const loginRequest = (data) => api.post("/auth/login", data);

// Cerrar sesión
export const logoutRequest = () => api.post("/auth/logout");

// Perfil
export const profileRequest = () => api.get("/auth/profile");

// Verificar token (opcional: úsalo solo si tu backend lo tiene)
export const verifyTokenRequest = () => api.get("/auth/verify");
