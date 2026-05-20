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

  const formatKg = (n) => `${Number(n || 0)} kg`;

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

  const nombreProducto = (item) =>
    item?.producto?.nombre ||
    item?.nombre ||
    item?.productName ||
    "Producto";

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getMyOrdersRequest();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error al cargar mis pedidos:", error);
      setErrorMsg(
        error.response?.data?.message?.[0] || "Error al cargar tus pedidos"
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
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "Entregado":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Cancelado":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
  };

  const getEstadoPagoClase = (estadoPago) => {
    switch (estadoPago) {
      case "Pagado":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-red-500/20 text-red-300 border-red-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Mis pedidos
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Aquí puedes revisar tus pedidos realizados, productos, cantidades,
            total y estado de entrega.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/60 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-300">
            Cargando pedidos...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-300 shadow-lg">
            <p className="text-xl font-bold mb-2">Aún no tienes pedidos</p>
            <p className="text-sm text-slate-400">
              Cuando realices un pedido, aparecerá aquí.
            </p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {orders.map((order) => {
            const shortId = order._id ? order._id.slice(-6) : "------";
            const estado = order.estado || "Pendiente";
            const estadoPago = order.estadoPago || "Pendiente";

            return (
              <div
                key={order._id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Pedido</p>

                    <p className="font-mono text-lg font-bold text-slate-100">
                      #{shortId}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatFecha(order.createdAt)}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm text-slate-400">Total</p>

                    <p className="text-3xl font-extrabold text-amber-400">
                      {formatMXN(order.total)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div
                    className={`border rounded-xl px-3 py-2 text-sm font-semibold ${getEstadoClase(
                      estado
                    )}`}
                  >
                    Estado pedido: {estado}
                  </div>

                  <div
                    className={`border rounded-xl px-3 py-2 text-sm font-semibold ${getEstadoPagoClase(
                      estadoPago
                    )}`}
                  >
                    Estado pago: {estadoPago}
                  </div>
                </div>

                {order.ruta && (
                  <div className="mb-4 bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300">
                    Ruta:{" "}
                    <span className="text-emerald-300 font-semibold">
                      {order.ruta}
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold mb-2 text-white">
                    Productos
                  </p>

                  <div className="space-y-2">
                    {(order.items || []).length > 0 ? (
                      order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-3 text-sm"
                        >
                          <span className="text-slate-200 break-words">
                            {nombreProducto(item)}
                          </span>

                          <span className="font-bold text-amber-300">
                            {formatKg(item.cantidad)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Sin productos</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}