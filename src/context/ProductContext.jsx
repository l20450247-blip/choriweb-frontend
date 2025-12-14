import { createContext, useContext, useState, useEffect } from "react";
import {
  getProductsRequest,
  getProductRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from "../api/products";

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState([]);

  // Obtener todos los productos
  const loadProducts = async () => {
    try {
      const res = await getProductsRequest();
      setProducts(res.data);
    } catch (error) {
      setErrors(["Error al obtener productos"]);
      console.error(error);
    }
  };

  // Crear producto
  const createProduct = async (data) => {
    try {
      const res = await createProductRequest(data);
      setProducts([...products, res.data]);
    } catch (error) {
      setErrors(["Error al crear producto"]);
      console.error(error);
    }
  };

  // Obtener un producto por ID
  const getProduct = async (id) => {
    try {
      const res = await getProductRequest(id);
      return res.data;
    } catch (error) {
      setErrors(["Error al obtener producto"]);
      console.error(error);
    }
  };

  // Editar producto
  const updateProduct = async (id, data) => {
    try {
      const res = await updateProductRequest(id, data);
      setProducts(products.map((p) => (p._id === id ? res.data : p)));
    } catch (error) {
      setErrors(["Error al actualizar producto"]);
      console.error(error);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    try {
      await deleteProductRequest(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      setErrors(["Error al eliminar producto"]);
      console.error(error);
    }
  };

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  // Limpiar errores visuales
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <ProductContext.Provider
      value={{
        products,
        errors,
        loadProducts,
        createProduct,
        getProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
