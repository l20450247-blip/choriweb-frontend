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

  const BACKEND_URL = (import.meta.env.VITE_API_URL || "")
    .trim()
    .replace(/\/+$/, "");

  let rawImagePath =
    imagenUrl ||
    product.imagen_url ||
    product.imagenUrl ||
    product.imagen ||
    product.imagenURL ||
    product.imageUrl ||
    product.image ||
    product.urlImagen ||
    product.foto ||
    "";

  if (!rawImagePath) {
    const candidate = Object.values(product).find((v) => {
      if (typeof v !== "string") return false;
      return (
        v.includes("/uploads/") || v.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
      );
    });
    rawImagePath = candidate || "";
  }

  const imageSrc = rawImagePath
    ? rawImagePath.startsWith("http")
      ? rawImagePath
      : BACKEND_URL
      ? `${BACKEND_URL}${rawImagePath}`
      : null
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
    <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-amber-400/70 transition-all duration-200">
      {imageSrc ? (
        <div className="h-56 sm:h-60 w-full overflow-hidden bg-slate-900">
          <img
            src={imageSrc}
            alt={nombre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-56 sm:h-60 w-full bg-slate-900 flex items-center justify-center text-slate-500 text-sm">
          Sin imagen
        </div>
      )}

      <div className="flex-1 flex flex-col px-4 sm:px-5 py-4 gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-slate-50 leading-tight break-words">
            {nombre}
          </h3>

          {categoria && (
            <p className="text-xs text-amber-300 mt-1">
              Categoría:{" "}
              <span className="text-slate-200">
                {categoria?.nombre || categoria}
              </span>
            </p>
          )}
        </div>

        {descripcion && (
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {descripcion}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-2xl font-extrabold text-amber-400">
            {formatMXN(precio)}
          </span>

          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
              disponible
                ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/60"
                : "bg-red-600/25 text-red-300 border border-red-500/60"
            }`}
          >
            {disponible ? "Disponible" : "Agotado"}
          </span>
        </div>

        {canBuy && (
          <div className="mt-3 bg-slate-900/70 border border-slate-700 rounded-2xl p-3 flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-200">
              Cantidad en kg
            </label>

            <input
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-amber-500"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            <button
              type="button"
              disabled={!disponible || loading}
              onClick={handleAddToCart}
              className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-base font-bold transition min-h-[48px] ${
                !disponible || loading
                  ? "bg-emerald-600/40 text-emerald-100 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
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