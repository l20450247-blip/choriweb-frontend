import { api } from "./axiosInstance";

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const logoutRequest = () => api.post("/auth/logout");
export const profileRequest = () => api.get("/auth/profile");
