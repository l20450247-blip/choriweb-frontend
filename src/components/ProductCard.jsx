// src/components/ProductCard.jsx
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product, canBuy = true }) {
  const { addToCart, loading } = useCart();
  const [cantidad, setCantidad] = useState(1);

  if (!product) return null;

  const {
    _id,
    nombre,
    descripcion,
    precio,
    categoria,
    disponible,
    imagenUrl,
  } = product;

  // URL base del backend
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // 1) Intentar con nombres de campos típicos
  let rawImagePath =
    imagenUrl ||
    product.imagen ||
    product.imagenURL ||
    product.imageUrl ||
    product.image ||
    product.urlImagen ||
    product.foto ||
    "";

  // 2) Si sigue vacío, buscar en TODOS los valores alguna cadena que parezca imagen
  if (!rawImagePath) {
    const candidate = Object.values(product).find((v) => {
      if (typeof v !== "string") return false;
      return (
        v.includes("/uploads/") ||
        v.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
      );
    });
    rawImagePath = candidate || "";
  }

  // 3) Construir la URL final
  const imageSrc = rawImagePath
    ? rawImagePath.startsWith("http")
      ? rawImagePath
      : `${API_URL}${rawImagePath}`
    : null;

  const handleAddToCart = async () => {
    const cantNum = Number(cantidad) || 1;
    if (cantNum <= 0) return;

    await addToCart(_id, cantNum);
    setCantidad(1);
  };

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-md">
      {/* Imagen */}
      {imageSrc && (
        <div className="h-56 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={nombre}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col px-5 py-4 gap-2">
        <h3 className="text-lg font-semibold text-slate-50">{nombre}</h3>

        {categoria && (
          <p className="text-xs text-amber-300">
            Categoría:{" "}
            <span className="text-slate-200">
              {categoria?.nombre || categoria}
            </span>
          </p>
        )}

        {descripcion && (
          <p className="text-sm text-slate-300 line-clamp-2">
            {descripcion}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-amber-400">
            {formatMXN(precio)}
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full ${
              disponible
                ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/60"
                : "bg-red-600/25 text-red-300 border border-red-500/60"
            }`}
          >
            {disponible ? "Disponible" : "Agotado"}
          </span>
        </div>

        {/* Controles de compra solo si canBuy === true */}
        {canBuy && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <span>Cantidad (kg):</span>
              <input
                type="number"
                min="1"
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-right"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={!disponible || loading}
              onClick={handleAddToCart}
              className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                !disponible || loading
                  ? "bg-emerald-600/40 text-emerald-100 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-slate-950"
              }`}
            >
              {loading ? "Procesando..." : "Agregar al carrito"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
