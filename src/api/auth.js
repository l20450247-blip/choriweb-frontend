// src/api/auth.js
import api from "./axiosInstance";

// Registro
export const registerRequest = (user) => api.post("/auth/register", user);

// Login
export const loginRequest = (user) => api.post("/auth/login", user);

// Logout
export const logoutRequest = () => api.post("/auth/logout");

// Perfil (usuario autenticado)
export const profileRequest = () => api.get("/auth/profile");
