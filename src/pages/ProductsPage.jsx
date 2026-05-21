// src/pages/ProductsPage.jsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/productos");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
      <div className="mb-4 sm:mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 text-white">
          Productos
        </h1>

        <p className="text-slate-300 text-sm sm:text-base">
          Explora los productos disponibles de ChoriMalpa y agrega tus kilos al
          carrito.
        </p>
      </div>

      {loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-300">
          Cargando productos...
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/60 text-red-100 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-400">
          No hay productos registrados todavía.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-3 sm:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} canBuy={!isAdmin} compact />
          ))}
        </div>
      )}
    </div>
  );
}