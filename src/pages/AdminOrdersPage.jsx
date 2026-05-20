// src/pages/AdminOrdersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import logoChoriMalpa from "../assets/logo-chorimalpa.png";
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

  const [archivedOrderIds, setArchivedOrderIds] = useState(() => {
    try {
      const guardados = localStorage.getItem("choriweb_admin_archived_orders");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

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

  const formatFechaSoloDia = (iso) => {
    if (!iso) return "Sin fecha de entrega";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Fecha inválida";
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const esEntregado = (order) => order?.estado === "Entregado";

  const cargarLogoBase64 = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getOrdersAdminRequest();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error al cargar pedidos (admin):", error);
      setErrorMsg(
        error.response?.data?.message?.[0] || "Error al cargar los pedidos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "choriweb_admin_archived_orders",
      JSON.stringify(archivedOrderIds)
    );
  }, [archivedOrderIds]);

  const groupedOrders = useMemo(() => {
    const grupos = {};
    const ordersVisibles = orders.filter(
      (order) => !archivedOrderIds.includes(order._id)
    );

    for (const order of ordersVisibles) {
      const fechaKey = order.fechaEntrega
        ? new Date(order.fechaEntrega).toISOString().split("T")[0]
        : "sin-fecha";

      const rutaKey = order.ruta || "Sin ruta";

      if (!grupos[fechaKey]) {
        grupos[fechaKey] = {
          fechaLabel:
            fechaKey === "sin-fecha"
              ? "Sin fecha de entrega"
              : formatFechaSoloDia(order.fechaEntrega),
          rutas: {},
        };
      }

      if (!grupos[fechaKey].rutas[rutaKey]) {
        grupos[fechaKey].rutas[rutaKey] = [];
      }

      grupos[fechaKey].rutas[rutaKey].push(order);
    }

    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
  }, [orders, archivedOrderIds]);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setSavingId(id);
      await updateOrderStatusRequest(id, nuevoEstado);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, estado: nuevoEstado } : o))
      );
    } catch (error) {
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
      alert(
        error.response?.data?.message?.[0] ||
          "Error al actualizar estado de pago"
      );
    } finally {
      setSavingId(null);
    }
  };

  const archivarEntregadosRuta = (rutaOrders) => {
    const entregados = rutaOrders
      .filter((order) => esEntregado(order))
      .map((order) => order._id);

    if (entregados.length === 0) {
      alert("No hay pedidos entregados para archivar en esta ruta.");
      return;
    }

    const confirmar = confirm(
      `Se archivarán ${entregados.length} pedido(s) entregado(s). No se borrarán de la base de datos, solo se ocultarán de esta vista.`
    );

    if (!confirmar) return;

    setArchivedOrderIds((prev) => [...new Set([...prev, ...entregados])]);
  };

  const obtenerResumenProductos = (rutaOrders) => {
    const resumen = {};

    rutaOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const nombre = item.producto?.nombre || "Producto";
        const cantidad = Number(item.cantidad || 0);
        if (!resumen[nombre]) resumen[nombre] = 0;
        resumen[nombre] += cantidad;
      });
    });

    return Object.entries(resumen).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));
  };

  const descargarPDFRuta = async (fechaLabel, rutaNombre, rutaOrders) => {
    try {
      const doc = new jsPDF({
        orientation: "l",
        unit: "mm",
        format: "a4",
      });

      const logoBase64 = await cargarLogoBase64(logoChoriMalpa);

      const totalRuta = rutaOrders.reduce(
        (acc, order) => acc + Number(order.total || 0),
        0
      );

      const resumenProductos = obtenerResumenProductos(rutaOrders);

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10;
      let y = 12;

      const limpiar = (txt) =>
        String(txt || "")
          .replace(/\s+/g, " ")
          .trim();

      const pintarEncabezadoTabla = () => {
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, y, pageWidth - margin * 2, 8, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        doc.text("#", 12, y + 5.5);
        doc.text("Cliente", 22, y + 5.5);
        doc.text("Teléfono", 58, y + 5.5);
        doc.text("Dirección / Referencia", 88, y + 5.5);
        doc.text("Productos (kg)", 168, y + 5.5);
        doc.text("Total", 235, y + 5.5);
        doc.text("Pago", 255, y + 5.5);
        doc.text("Ent.", 278, y + 5.5);

        doc.setTextColor(0, 0, 0);
        y += 9;
      };

      const revisarSaltoPagina = (alto = 15) => {
        if (y + alto > pageHeight - 18) {
          doc.addPage();
          y = 12;
          pintarEncabezadoTabla();
        }
      };

      doc.addImage(logoBase64, "PNG", 10, y, 20, 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("CHORIMALPA", 35, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Hoja de ruta / carga para rutero", 35, y + 15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Fecha: ${fechaLabel}`, 120, y + 7);
      doc.text(`Ruta: ${rutaNombre}`, 120, y + 14);
      doc.text(`Pedidos: ${rutaOrders.length}`, 220, y + 7);
      doc.text(`Total: ${formatMXN(totalRuta)}`, 220, y + 14);

      y += 28;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Resumen de carga:", 10, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const resumenTexto =
        resumenProductos.length > 0
          ? resumenProductos
              .map((item) => `${item.nombre}: ${formatKg(item.cantidad)}`)
              .join("   |   ")
          : "Sin productos registrados.";

      const resumenLines = doc.splitTextToSize(resumenTexto, 235);
      doc.text(resumenLines, 45, y);
      y += resumenLines.length * 4 + 7;

      pintarEncabezadoTabla();

      rutaOrders.forEach((order, index) => {
        const cliente = limpiar(order.usuario?.nombre || "Sin nombre");
        const telefono = limpiar(order.direccion?.telefono || "Sin teléfono");

        const direccion = limpiar(
          `${order.direccion?.calle || ""} ${order.direccion?.numero || ""}, ${
            order.direccion?.colonia || ""
          }, ${order.direccion?.municipio || ""}`
        );

        const referencias = limpiar(order.direccion?.referencias || "");
        const direccionCompleta = referencias
          ? `${direccion} / Ref: ${referencias}`
          : direccion;

        const productos = (order.items || [])
          .map((item) => {
            const nombre = item.producto?.nombre || "Producto";
            const cantidad = item.cantidad || 0;
            return `${nombre} — ${formatKg(cantidad)}`;
          })
          .join(", ");

        const dirLines = doc.splitTextToSize(direccionCompleta, 74);
        const prodLines = doc.splitTextToSize(productos || "Sin productos", 62);

        const altoFila =
          Math.max(dirLines.length, prodLines.length, 1) * 4 + 8;

        revisarSaltoPagina(altoFila);

        const inicioY = y;

        doc.setDrawColor(180, 180, 180);
        doc.rect(margin, inicioY, pageWidth - margin * 2, altoFila);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(`${index + 1}`, 12, inicioY + 6);
        doc.text(cliente.substring(0, 22), 22, inicioY + 6);
        doc.text(telefono.substring(0, 18), 58, inicioY + 6);
        doc.text(dirLines, 88, inicioY + 6);
        doc.text(prodLines, 168, inicioY + 6);
        doc.text(formatMXN(order.total), 235, inicioY + 6);
        doc.text(order.estadoPago || "Pendiente", 255, inicioY + 6);

        doc.rect(278, inicioY + 2.5, 7, 7);

        y += altoFila;
      });

      revisarSaltoPagina(30);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Firmas:", 10, y);

      y += 13;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.line(20, y, 95, y);
      doc.text("Firma del rutero", 42, y + 5);

      doc.line(120, y, 195, y);
      doc.text("Firma de administración", 137, y + 5);

      doc.text("Observaciones:", 220, y - 7);
      doc.rect(220, y - 4, 65, 18);

      const nombreArchivo = `hoja-ruta-${rutaNombre
        .replace(/\s+/g, "-")
        .toLowerCase()}-${fechaLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`;

      doc.save(nombreArchivo);
    } catch (error) {
      console.error("Error al generar PDF de ruta:", error);
      alert("No se pudo descargar el PDF de la ruta");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Administración de pedidos
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Revisa pedidos por fecha y ruta. Para entregar al rutero, descarga
            la hoja de ruta con resumen de carga y detalle de clientes.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-amber-200">
            🟡 Pendiente / En camino
          </div>
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-3 text-emerald-200">
            🟢 Entregado
          </div>
          <div className="rounded-xl border border-slate-500/40 bg-slate-800 px-3 py-3 text-slate-300">
            📦 Archivados solo se ocultan
          </div>
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-300">
            No hay pedidos registrados.
          </div>
        )}

        {!loading && orders.length > 0 && groupedOrders.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-300">
            No hay pedidos visibles. Los entregados pueden estar archivados en
            esta vista.
          </div>
        )}

        {!loading &&
          groupedOrders.map(([fechaKey, grupoFecha]) => (
            <div key={fechaKey} className="mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-amber-400 mb-4">
                {grupoFecha.fechaLabel}
              </h2>

              {Object.entries(grupoFecha.rutas).map(
                ([rutaNombre, rutaOrders]) => {
                  const entregadosRuta = rutaOrders.filter((order) =>
                    esEntregado(order)
                  ).length;

                  const totalRuta = rutaOrders.reduce(
                    (acc, order) => acc + Number(order.total || 0),
                    0
                  );

                  return (
                    <div
                      key={`${fechaKey}-${rutaNombre}`}
                      className="mb-6 bg-slate-800/70 rounded-2xl border border-slate-700 overflow-hidden shadow-lg"
                    >
                      <div className="px-4 md:px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-extrabold text-emerald-400">
                            {rutaNombre}
                          </h3>

                          <p className="text-sm text-slate-300 mt-1">
                            Pedidos visibles: {rutaOrders.length} |
                            Entregados: {entregadosRuta}
                          </p>
                        </div>

                        <div className="flex flex-col lg:items-end gap-3">
                          <div className="text-sm text-slate-300">
                            Total ruta:{" "}
                            <span className="font-extrabold text-white text-lg">
                              {formatMXN(totalRuta)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
                            <button
                              onClick={() =>
                                descargarPDFRuta(
                                  grupoFecha.fechaLabel,
                                  rutaNombre,
                                  rutaOrders
                                )
                              }
                              className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-3 text-sm font-bold text-white min-h-[48px]"
                            >
                              Descargar hoja de ruta PDF
                            </button>

                            <button
                              onClick={() => archivarEntregadosRuta(rutaOrders)}
                              className="rounded-xl bg-slate-600 hover:bg-slate-700 px-4 py-3 text-sm font-bold text-white min-h-[48px]"
                            >
                              Archivar entregados
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm min-w-[850px]">
                          <thead className="bg-slate-800/70">
                            <tr>
                              <th className="px-6 py-3 text-left font-semibold">
                                Pedido
                              </th>
                              <th className="px-6 py-3 text-left font-semibold">
                                Cliente
                              </th>
                              <th className="px-6 py-3 text-left font-semibold">
                                Fecha pedido
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
                            {rutaOrders.map((order) => {
                              const shortId = order._id
                                ? order._id.slice(-6)
                                : "------";

                              const entregado = esEntregado(order);

                              return (
                                <tr
                                  key={order._id}
                                  className={`border-t border-slate-700/60 ${
                                    entregado
                                      ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                                      : "bg-amber-500/10 hover:bg-amber-500/20"
                                  }`}
                                >
                                  <td className="px-6 py-3 font-mono text-slate-200">
                                    #{shortId}
                                  </td>

                                  <td className="px-6 py-3">
                                    {order.usuario?.nombre || "Sin nombre"}
                                  </td>

                                  <td className="px-6 py-3">
                                    {formatFecha(order.createdAt)}
                                  </td>

                                  <td className="px-6 py-3 text-right">
                                    {formatMXN(order.total)}
                                  </td>

                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                          entregado
                                            ? "bg-emerald-400"
                                            : "bg-amber-400"
                                        }`}
                                      />

                                      <select
                                        value={order.estado || "Pendiente"}
                                        disabled={savingId === order._id}
                                        onChange={(e) =>
                                          handleEstadoChange(
                                            order._id,
                                            e.target.value
                                          )
                                        }
                                        className={`rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                                          entregado
                                            ? "bg-emerald-950 border-emerald-600 text-emerald-100 focus:ring-emerald-500/70"
                                            : "bg-amber-950 border-amber-600 text-amber-100 focus:ring-amber-500/70"
                                        }`}
                                      >
                                        <option value="Pendiente">
                                          Pendiente
                                        </option>
                                        <option value="Preparando">
                                          Preparando
                                        </option>
                                        <option value="En camino">
                                          En camino
                                        </option>
                                        <option value="Entregado">
                                          Entregado
                                        </option>
                                        <option value="Cancelado">
                                          Cancelado
                                        </option>
                                      </select>
                                    </div>
                                  </td>

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
                                      <option value="Pendiente">
                                        Pendiente
                                      </option>
                                      <option value="Pagado">Pagado</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden p-3 space-y-3">
                        {rutaOrders.map((order) => {
                          const shortId = order._id
                            ? order._id.slice(-6)
                            : "------";

                          const entregado = esEntregado(order);

                          return (
                            <div
                              key={order._id}
                              className={`rounded-2xl border p-4 ${
                                entregado
                                  ? "bg-emerald-500/10 border-emerald-500/40"
                                  : "bg-amber-500/10 border-amber-500/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                  <p className="text-xs text-slate-400">
                                    Pedido
                                  </p>
                                  <p className="font-mono text-lg font-bold text-white">
                                    #{shortId}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs text-slate-400">
                                    Total
                                  </p>
                                  <p className="text-xl font-extrabold text-amber-400">
                                    {formatMXN(order.total)}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm mb-4">
                                <p>
                                  <span className="text-slate-400">
                                    Cliente:
                                  </span>{" "}
                                  <span className="font-semibold text-white">
                                    {order.usuario?.nombre || "Sin nombre"}
                                  </span>
                                </p>

                                <p>
                                  <span className="text-slate-400">
                                    Fecha:
                                  </span>{" "}
                                  <span className="text-slate-200">
                                    {formatFecha(order.createdAt)}
                                  </span>
                                </p>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">
                                    Estado pedido
                                  </label>
                                  <select
                                    value={order.estado || "Pendiente"}
                                    disabled={savingId === order._id}
                                    onChange={(e) =>
                                      handleEstadoChange(
                                        order._id,
                                        e.target.value
                                      )
                                    }
                                    className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold focus:outline-none focus:ring-2 ${
                                      entregado
                                        ? "bg-emerald-950 border-emerald-600 text-emerald-100 focus:ring-emerald-500/70"
                                        : "bg-amber-950 border-amber-600 text-amber-100 focus:ring-amber-500/70"
                                    }`}
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Preparando">
                                      Preparando
                                    </option>
                                    <option value="En camino">En camino</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">
                                    Estado pago
                                  </label>
                                  <select
                                    value={order.estadoPago || "Pendiente"}
                                    disabled={savingId === order._id}
                                    onChange={(e) =>
                                      handlePagoChange(
                                        order._id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagado">Pagado</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ))}
      </div>
    </div>
  );
}