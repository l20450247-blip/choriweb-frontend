import api from "./axiosInstance";

// función para forzar token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// Crear pedido
export const createOrderRequest = (datos) =>
  api.post("/pedidos", datos, getAuthConfig());

// Cliente: ver sus pedidos
export const getMyOrdersRequest = () =>
  api.get("/pedidos/mis-pedidos", getAuthConfig());

// Admin: ver todos los pedidos
export const getOrdersAdminRequest = () =>
  api.get("/pedidos", getAuthConfig());

// Admin: cambiar estado del pedido
export const updateOrderStatusRequest = (id, estado) =>
  api.put(
    `/pedidos/${id}/estado`,
    { estado },
    getAuthConfig()
  );

// Admin: cambiar estado de pago
export const updateOrderPaymentStatusRequest = (id, estadoPago) =>
  api.put(
    `/pedidos/${id}/pago`,
    { estadoPago },
    getAuthConfig()
  );