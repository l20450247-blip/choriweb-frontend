import { api } from "./axiosInstance";

export const getProductsRequest = () => api.get("/productos");
export const getProductRequest = (id) => api.get(`/productos/${id}`);
export const createProductRequest = (data) => api.post("/productos", data);
export const updateProductRequest = (id, data) =>
  api.put(`/productos/${id}`, data);
export const deleteProductRequest = (id) =>
  api.delete(`/productos/${id}`);
