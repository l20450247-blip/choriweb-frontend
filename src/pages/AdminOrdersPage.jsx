// src/pages/AdminOrdersPage.jsx
import { useEffect, useState } from "react";
import {
  getOrdersAdminRequest,
  updateOrderStatusRequest,
  updateOrderPaymentStatusRequest,
} from "../api/orders";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
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
      const res = await getOrdersAdminRequest();
      setOrders(res.data || []);
    } catch (error) {
      console.error(" Error al cargar pedidos (admin):", error);
      setErrorMsg(
        error.response?.data?.message?.[0] ||
          "Error al cargar los pedidos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setSavingId(id);
      await updateOrderStatusRequest(id, nuevoEstado);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, estado: nuevoEstado } : o
        )
      );
    } catch (error) {
      console.error(" Error al actualizar estado:", error);
      alert(
        error.response?.data?.message?.[0] ||
          "Error al actualizar estado del pedido"
      );
    } finally {
      setSavingId(null);
    }
  };

  const handlePagoChange = async (id, nuevoEstadoPago) => {
    try {
      setSavingId(id);
      await updateOrderPaymentStatusRequest(id, nuevoEstadoPago);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, estadoPago: nuevoEstadoPago } : o
        )
      );
    } catch (error) {
      console.error(" Error al actualizar estado de pago:", error);
      alert(
        error.response?.data?.message?.[0] ||
          "Error al actualizar estado de pago"
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Administración de pedidos
        </h1>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/60 px-4 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {loading && (
          <p className="text-slate-300">Cargando pedidos...</p>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-slate-300 mt-4">
            No hay pedidos registrados.
          </p>
        )}

        {orders.length > 0 && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/90">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Estado pedido
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Estado pago
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const shortId = order._id
                    ? order._id.slice(-6)
                    : "------";
                  const nombreCliente =
                    order.usuario?.nombre || "Sin nombre";

                  return (
                    <tr
                      key={order._id}
                      className="border-t border-slate-700/60"
                    >
                      <td className="px-6 py-3 font-mono text-slate-200">
                        #{shortId}
                      </td>
                      <td className="px-6 py-3">{nombreCliente}</td>
                      <td className="px-6 py-3">
                        {formatFecha(order.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {formatMXN(order.total)}
                      </td>

                      {/* Estado del pedido */}
                      <td className="px-6 py-3">
                        <select
                          value={order.estado || "Pendiente"}
                          disabled={savingId === order._id}
                          onChange={(e) =>
                            handleEstadoChange(
                              order._id,
                              e.target.value
                            )
                          }
                          className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En camino">En camino</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>

                      {/* Estado de pago */}
                      <td className="px-6 py-3">
                        <select
                          value={order.estadoPago || "Pendiente"}
                          disabled={savingId === order._id}
                          onChange={(e) =>
                            handlePagoChange(
                              order._id,
                              e.target.value
                            )
                          }
                          className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pagado">Pagado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
