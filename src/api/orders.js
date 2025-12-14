// src/api/orders.js
import api from "./axiosInstance";

// Crear pedido
export const createOrderRequest = (datos) => api.post("/pedidos", datos);

// Cliente: ver sus pedidos
export const getMyOrdersRequest = () => api.get("/pedidos/mis-pedidos");

// Admin: ver todos los pedidos
export const getOrdersAdminRequest = () => api.get("/pedidos");

// Admin: cambiar estado del pedido
export const updateOrderStatusRequest = (id, estado) =>
  api.put(`/pedidos/${id}/estado`, { estado });

// Admin: cambiar estado de pago
export const updateOrderPaymentStatusRequest = (id, estadoPago) =>
  api.put(`/pedidos/${id}/pago`, { estadoPago });
