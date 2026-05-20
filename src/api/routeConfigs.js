import api from "./axiosInstance";

export const getRouteConfigsRequest = () => api.get("/config-rutas");

export const createRouteConfigRequest = (data) =>
  api.post("/config-rutas", data);

export const updateRouteConfigRequest = (id, data) =>
  api.put(`/config-rutas/${id}`, data);

export const deleteRouteConfigRequest = (id) =>
  api.delete(`/config-rutas/${id}`);