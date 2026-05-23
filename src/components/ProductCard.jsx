// src/components/ProductCard.jsx
import { useState } from "react";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product, canBuy = true, compact = false }) {
  const { addToCart, loading } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const { _id, nombre, descripcion, precio, categoria, disponible, imagenUrl } =
    product;

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

    setAdded(true);
    setCantidad(1);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-amber-400/80 hover:shadow-amber-500/10 hover:scale-[1.015] transition-all duration-300">
      {imageSrc ? (
        <div
          className={`w-full overflow-hidden bg-slate-900 ${
            compact ? "h-32 xs:h-36 sm:h-52" : "h-56 sm:h-60"
          }`}
        >
          <img
            src={imageSrc}
            alt={nombre}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className={`w-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs sm:text-sm ${
            compact ? "h-32 xs:h-36 sm:h-52" : "h-56 sm:h-60"
          }`}
        >
          Sin imagen
        </div>
      )}

      <div className="flex-1 flex flex-col px-3 sm:px-5 py-3 sm:py-4 gap-2 sm:gap-3">
        <div>
          <h3 className="text-base sm:text-xl font-extrabold text-slate-50 leading-tight break-words line-clamp-2">
            {nombre}
          </h3>

          {categoria && (
            <p className="text-[11px] sm:text-xs text-amber-300 mt-1 line-clamp-2">
              Categoría:{" "}
              <span className="text-slate-200">
                {categoria?.nombre || categoria}
              </span>
            </p>
          )}
        </div>

        {descripcion && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {descripcion}
          </p>
        )}

        <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
            {formatMXN(precio)}
          </span>

          <span
            className={`text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold w-fit whitespace-nowrap ${
              disponible
                ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/60"
                : "bg-red-600/25 text-red-300 border border-red-500/60"
            }`}
          >
            {disponible ? "Disponible" : "Agotado"}
          </span>
        </div>

        {canBuy && (
          <div className="mt-2 sm:mt-3 bg-slate-900/70 border border-slate-700 rounded-2xl p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-semibold text-slate-200">
              Kg
            </label>

            <input
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-amber-500"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            <button
              type="button"
              disabled={!disponible || loading}
              onClick={handleAddToCart}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base font-extrabold transition-all duration-200 min-h-[42px] sm:min-h-[48px] active:scale-95 ${
                !disponible || loading
                  ? "bg-emerald-600/40 text-emerald-100 cursor-not-allowed"
                  : added
                  ? "bg-amber-400 text-slate-950"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {loading ? (
                "..."
              ) : added ? (
                <>
                  <FaCheck />
                  Agregado
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Agregar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}