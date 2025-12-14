// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  addToCartRequest,
  getCartRequest,
  clearCartRequest,
} from "../api/cart";

// Contexto sin valor por defecto, así detectamos si falta el Provider
const CartContext = createContext(null);

// 🔹 Normalizar la estructura del carrito que viene del backend
function normalizeCartData(data) {
  const items = data?.items || [];

  // Intentar usar total del backend, si viene bien
  let total = Number(data?.total || 0);

  // Si el total viene en 0 o no viene, lo calculamos aquí
  if (!total) {
    total = items.reduce((sum, item) => {
      const cantidad =
        item.cantidad ??
        item.quantity ??
        item.qty ??
        0;

      const precioUnidad =
        item.precioUnitario ??
        item.precio ??
        item.price ??
        item.producto?.precio ??
        0;

      const subtotal =
        item.subtotal ??
        cantidad * precioUnidad;

      return sum + Number(subtotal || 0);
    }, 0);
  }

  return {
    ...data,
    items,
    total,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // Cargar carrito del backend
  const loadCart = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await getCartRequest();
      console.log("GET /carrito =>", res.data);

      const normalized = normalizeCartData(res.data || {});
      setCart(normalized);
    } catch (error) {
      console.error(" Error al cargar carrito:", error);
      setErrorMsg(
        error.response?.data?.message?.[0] ||
          "Error al cargar el carrito"
      );
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto al carrito
  const addToCart = async (productoId, cantidad = 1) => {
    const cant = Number(cantidad) || 1; // asegurar número

    try {
      setLoading(true);
      setErrorMsg("");
      setOkMsg("");

      console.log(" addToCart() llamado con:", {
        productoId,
        cantidad: cant,
      });

      const res = await addToCartRequest(productoId, cant);
      console.log("POST /carrito/agregar =>", res.data);

      const normalized = normalizeCartData(res.data || {});
      setCart(normalized);

      setOkMsg("Producto agregado al carrito ");
    } catch (error) {
      console.error(" Error al agregar al carrito:", error);
      setErrorMsg(
        error.response?.data?.message?.[0] ||
          "Error al agregar al carrito"
      );
    } finally {
      setLoading(false);
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      await clearCartRequest();
      setCart({ items: [], total: 0 });
      setOkMsg("Carrito vaciado");
    } catch (error) {
      console.error(" Error al vaciar carrito:", error);
      setErrorMsg(
        error.response?.data?.message?.[0] ||
          "Error al vaciar el carrito"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar carrito al montar
  useEffect(() => {
    loadCart();
  }, []);

  const value = {
    cart,
    loading,
    errorMsg,
    okMsg,
    addToCart,
    loadCart,
    clearCart,
  };

  console.log(" CartContext value en Provider:", value);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart debe usarse dentro de un <CartProvider> (revisa main.jsx)"
    );
  }
  console.log(" useCart() devuelve:", ctx);
  return ctx;
}
