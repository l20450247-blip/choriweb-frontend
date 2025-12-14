// src/api/cart.js
import api from "./axiosInstance";

// Agregar producto al carrito
export const addToCartRequest = (productoId, cantidad = 1) =>
  api.post("/carrito/agregar", { productoId, cantidad });

// Obtener carrito del usuario
export const getCartRequest = () => api.get("/carrito");

// Vaciar carrito
export const clearCartRequest = () => api.delete("/carrito/limpiar");
