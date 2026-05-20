import api from "./axiosInstance";

export const getRuterosRequest = () => api.get("/users/ruteros");

export const createRuteroRequest = (data) =>
  api.post("/users/create-rutero", data);