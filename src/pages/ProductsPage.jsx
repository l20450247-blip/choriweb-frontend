// src/pages/ProductsPage.jsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance"; // ✅ usa la instancia central

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

        // ✅ Si tu backend expone /api/productos (por tu app.js sí)
        const res = await api.get("/productos");

        // axios regresa data directo
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Productos</h1>
      <p className="text-slate-300 mb-6">
        Explora los productos disponibles de Choriweb.
      </p>

      {loading && <div className="text-slate-300">Cargando productos...</div>}

      {error && (
        <div className="bg-red-500/80 text-white px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-slate-400">
          No hay productos registrados todavía.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              canBuy={!isAdmin} // SOLO CLIENTE PUEDE VER BOTÓN DE COMPRA
            />
          ))}
        </div>
      )}
    </div>
  );
}
