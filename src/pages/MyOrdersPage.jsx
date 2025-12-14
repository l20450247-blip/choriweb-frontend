// src/pages/MyOrdersPage.jsx
import { useEffect, useState } from "react";
import { getMyOrdersRequest } from "../api/orders";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const formatFecha = (iso) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Fecha inválida";
    return d.toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getMyOrdersRequest();
      setOrders(res.data || []);
    } catch (error) {
      console.error(" Error al cargar mis pedidos:", error);
      setErrorMsg(
        error.response?.data?.message?.[0] ||
          "Error al cargar tus pedidos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getEstadoClase = (estado) => {
    switch (estado) {
      case "En camino":
        return "text-sky-300";
      case "Entregado":
        return "text-emerald-400";
      default:
        return "text-amber-300";
    }
  };

  const getEstadoPagoClase = (estadoPago) => {
    switch (estadoPago) {
      case "Pagado":
        return "text-emerald-400";
      default:
        // Pendiente u otro
        return "text-red-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mis pedidos</h1>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/60 px-4 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {loading && (
          <p className="text-slate-300">Cargando pedidos...</p>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-slate-300 mt-6">
            Aún no tienes pedidos.
          </p>
        )}

        <div className="space-y-4 mt-4">
          {orders.map((order) => {
            const shortId = order._id
              ? order._id.slice(-6)
              : "------";

            const productosTexto =
              order.items && order.items.length > 0
                ? order.items
                    .map(
                      (it) =>
                        `${it.nombre || "Producto"} x ${
                          it.cantidad || 0
                        }`
                    )
                    .join(", ")
                : "Sin productos";

            const estado = order.estado || "Pendiente";
            const estadoPago = order.estadoPago || "Pendiente";

            return (
              <div
                key={order._id}
                className="bg-slate-800/70 border border-slate-700 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                {/* Izquierda: info básica */}
                <div>
                  <p className="text-sm text-slate-400">
                    Pedido{" "}
                    <span className="font-mono text-slate-200">
                      #{shortId}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFecha(order.createdAt)}
                  </p>

                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Productos: </span>
                    <span className="text-slate-200">
                      {productosTexto}
                    </span>
                  </p>
                </div>

                {/* Derecha: totales y estados */}
                <div className="text-right space-y-1">
                  <p className="text-sm">
                    Total:{" "}
                    <span className="font-semibold text-amber-400">
                      {formatMXN(order.total)}
                    </span>
                  </p>

                  <p className="text-xs">
                    Estado pedido:{" "}
                    <span
                      className={`font-semibold ${getEstadoClase(
                        estado
                      )}`}
                    >
                      {estado}
                    </span>
                  </p>

                  <p className="text-xs">
                    Estado pago:{" "}
                    <span
                      className={`font-semibold ${getEstadoPagoClase(
                        estadoPago
                      )}`}
                    >
                      {estadoPago}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
