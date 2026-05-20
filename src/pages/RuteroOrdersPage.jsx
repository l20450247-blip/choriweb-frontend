import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import api from "../api/axiosInstance";
import logoChoriMalpa from "../assets/logo-chorimalpa.png";

const CACHE_PEDIDOS_KEY = "choriweb_rutero_pedidos_cache";
const PENDING_ACTIONS_KEY = "choriweb_rutero_pending_actions";
const LOGO_CACHE_KEY = "choriweb_logo_ticket_base64";

export default function RuteroOrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [logoTicketBase64, setLogoTicketBase64] = useState("");

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const formatKg = (n) => `${Number(n || 0)} kg`;

  const formatFecha = (iso) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
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
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatearMetodoPago = (metodo) => {
    if (metodo === "pago_en_entrega") return "Efectivo";
    if (metodo === "transferencia") return "Transferencia";
    return metodo || "No especificado";
  };

  const nombreProducto = (item) =>
    item?.producto?.nombre ||
    item?.nombre ||
    item?.productName ||
    "Producto sin nombre";

  const estadoPedidoTicket = (order) => {
    if (order?.estadoPago === "Pagado") return "Entregado";
    return order?.estado || "Pendiente";
  };

  const leerPendientes = () => {
    try {
      return JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const guardarPendientes = (acciones) => {
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(acciones));
    setPendingCount(acciones.length);
  };

  const guardarPedidosCache = (lista) => {
    localStorage.setItem(CACHE_PEDIDOS_KEY, JSON.stringify(lista || []));
  };

  const leerPedidosCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_PEDIDOS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const agregarAccionPendiente = (accionNueva) => {
    const actuales = leerPendientes();

    const filtradas = actuales.filter(
      (accion) => !(accion.id === accionNueva.id && accion.tipo === accionNueva.tipo)
    );

    const nuevas = [
      ...filtradas,
      {
        ...accionNueva,
        fechaLocal: new Date().toISOString(),
      },
    ];

    guardarPendientes(nuevas);
  };

  const actualizarPedidoLocal = (id, cambios) => {
    setPedidos((prev) => {
      let nuevos = prev.map((pedido) =>
        pedido._id === id ? { ...pedido, ...cambios } : pedido
      );

      if (cambios.estado === "Entregado") {
        nuevos = nuevos.filter((pedido) => pedido._id !== id);
      }

      guardarPedidosCache(nuevos);
      return nuevos;
    });

    setSelectedOrder((prev) =>
      prev?._id === id ? { ...prev, ...cambios } : prev
    );
  };

  const cargarLogoBase64 = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = reject;
      img.src = src;
    });

  const prepararLogoOffline = async () => {
    try {
      const logoGuardado = localStorage.getItem(LOGO_CACHE_KEY);

      if (logoGuardado) {
        setLogoTicketBase64(logoGuardado);
        return;
      }

      const logoBase64 = await cargarLogoBase64("/logo-chorimalpa.png");

      localStorage.setItem(LOGO_CACHE_KEY, logoBase64);
      setLogoTicketBase64(logoBase64);
    } catch (error) {
      console.error("No se pudo preparar logo offline:", error);
    }
  };

  const getPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pedidos/rutero/activos");
      const lista = res.data || [];
      setPedidos(lista);
      guardarPedidosCache(lista);
    } catch (error) {
      const cache = leerPedidosCache();

      if (cache.length > 0) {
        setPedidos(cache);
      } else {
        alert(error.response?.data?.message?.[0] || "Error al cargar pedidos");
      }
    } finally {
      setLoading(false);
    }
  };

  const sincronizarPendientes = async () => {
    const pendientes = leerPendientes();
    if (pendientes.length === 0 || !navigator.onLine) return;

    try {
      setSyncing(true);

      for (const accion of pendientes) {
        if (accion.tipo === "estado") {
          await api.put(`/pedidos/${accion.id}/estado-rutero`, {
            estado: accion.valor,
          });
        }

        if (accion.tipo === "pago") {
          await api.put(`/pedidos/${accion.id}/pago-rutero`, {
            estadoPago: accion.valor,
          });
        }
      }

      guardarPendientes([]);
      await getPedidos();
    } catch (error) {
      console.error("Error al sincronizar acciones offline:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    setPendingCount(leerPendientes().length);
    prepararLogoOffline();
    getPedidos();

    const handleOnline = () => {
      setIsOnline(true);
      sincronizarPendientes();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const cambiarEstado = async (id, estado) => {
    actualizarPedidoLocal(id, { estado });

    if (!navigator.onLine) {
      agregarAccionPendiente({ id, tipo: "estado", valor: estado });
      return;
    }

    try {
      await api.put(`/pedidos/${id}/estado-rutero`, { estado });
      await getPedidos();
    } catch (error) {
      agregarAccionPendiente({ id, tipo: "estado", valor: estado });
      alert(
        "No hay conexión estable. El cambio se guardó en este teléfono y se sincronizará cuando vuelva internet."
      );
    }
  };

  const cambiarPago = async (id, estadoPago) => {
    actualizarPedidoLocal(id, { estadoPago });

    if (!navigator.onLine) {
      agregarAccionPendiente({ id, tipo: "pago", valor: estadoPago });
      return;
    }

    try {
      await api.put(`/pedidos/${id}/pago-rutero`, { estadoPago });
      await getPedidos();
    } catch (error) {
      agregarAccionPendiente({ id, tipo: "pago", valor: estadoPago });
      alert(
        "No hay conexión estable. El pago se guardó en este teléfono y se sincronizará cuando vuelva internet."
      );
    }
  };

  const imprimirTicket = (order) => {
    const shortId = order?._id ? order._id.slice(-6) : "------";
    const cliente = order?.usuario?.nombre || "Cliente";
    const logoParaTicket =
      logoTicketBase64 || localStorage.getItem(LOGO_CACHE_KEY) || "/logo-chorimalpa.png";

    const productosHtml =
      order?.items?.length > 0
        ? order.items
            .map((item) => {
              const nombre = nombreProducto(item);
              const cantidad = formatKg(item?.cantidad || 0);
              const subtotal = formatMXN(item?.subtotal || 0);

              return `
                <tr>
                  <td style="padding:6px 0;">${nombre}</td>
                  <td style="padding:6px 0; text-align:center;">${cantidad}</td>
                  <td style="padding:6px 0; text-align:right;">${subtotal}</td>
                </tr>
              `;
            })
            .join("")
        : `<tr><td colspan="3" style="padding:8px 0; text-align:center;">Sin productos</td></tr>`;

    const printWindow = window.open("", "_blank", "width=700,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Pedido #${shortId}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; background:#fff; color:#111; margin:0; padding:20px; }
            .ticket { width:320px; margin:0 auto; padding:18px; border:1px solid #ddd; border-radius:10px; }
            .center { text-align:center; }
            .logo { width:84px; height:84px; object-fit:contain; display:block; margin:0 auto 8px auto; filter:grayscale(100%); }
            .empresa { font-size:26px; font-weight:800; margin:0; }
            .subtitulo { font-size:13px; color:#444; margin-top:4px; }
            .folio { font-size:16px; font-weight:800; margin-top:4px; }
            .linea { border-top:1px dashed #444; margin:14px 0; }
            .bloque { font-size:14px; line-height:1.45; margin-bottom:10px; }
            .titulo-seccion { font-weight:700; font-size:14px; margin-bottom:6px; text-transform:uppercase; }
            table { width:100%; border-collapse:collapse; font-size:13px; }
            th { text-align:left; border-bottom:1px solid #ccc; padding:6px 0; }
            .total-box { text-align:center; margin-top:16px; padding-top:12px; border-top:2px solid #111; }
            .total-label { font-size:14px; color:#444; }
            .total { font-size:30px; font-weight:900; margin-top:4px; }
            .footer { margin-top:16px; text-align:center; font-size:12px; color:#444; }
            @media print {
              body { padding:0; }
              .ticket { border:none; width:80mm; padding:0; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center">
              <img src="${logoParaTicket}" class="logo" />
              <div class="empresa">CHORIMALPA</div>
              <div class="subtitulo">Comprobante de pedido</div>
              <div class="folio">Folio #${shortId}</div>
            </div>

            <div class="linea"></div>

            <div class="bloque">
              <div><strong>Fecha:</strong> ${formatFecha(order?.createdAt)}</div>
              <div><strong>Entrega:</strong> ${formatFechaSoloDia(order?.fechaEntrega)}</div>
              <div><strong>Ruta:</strong> ${order?.ruta || "Sin ruta"}</div>
              <div><strong>Cliente:</strong> ${cliente}</div>
              <div><strong>Estado pedido:</strong> ${estadoPedidoTicket(order)}</div>
              <div><strong>Estado pago:</strong> ${order?.estadoPago || "Pendiente"}</div>
              <div><strong>Método de pago:</strong> ${formatearMetodoPago(order?.metodoPago)}</div>
            </div>

            <div class="linea"></div>

            <div class="bloque">
              <div class="titulo-seccion">Entrega</div>
              <div>${order?.direccion?.calle || ""} ${order?.direccion?.numero || ""}</div>
              <div>${order?.direccion?.colonia || ""}</div>
              <div>${order?.direccion?.municipio || ""}, ${order?.direccion?.estado || ""}</div>
              <div>CP ${order?.direccion?.cp || ""}</div>
              <div><strong>Tel:</strong> ${order?.direccion?.telefono || "Sin teléfono"}</div>
              <div><strong>Ref:</strong> ${order?.direccion?.referencias || "Sin referencias"}</div>
            </div>

            <div class="linea"></div>

            <div class="bloque">
              <div class="titulo-seccion">Productos</div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align:center;">Cant. kg</th>
                    <th style="text-align:right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${productosHtml}</tbody>
              </table>
            </div>

            <div class="total-box">
              <div class="total-label">TOTAL</div>
              <div class="total">${formatMXN(order?.total || 0)}</div>
            </div>

            <div class="footer">
              <div>Gracias por su compra</div>
              <div>ChoriMalpa</div>
            </div>
          </div>

          <script>
            window.onload = function () { window.print(); };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const descargarPDF = async (order) => {
    try {
      const shortId = order?._id ? order._id.slice(-6) : "------";
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [80, 180],
      });

      const logoBase64 =
        logoTicketBase64 ||
        localStorage.getItem(LOGO_CACHE_KEY) ||
        (await cargarLogoBase64("/logo-chorimalpa.png"));

      const centerX = 40;
      let y = 8;

      doc.addImage(logoBase64, "PNG", 28, y, 24, 24);
      y += 28;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CHORIMALPA", centerX, y, { align: "center" });

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Comprobante de pedido", centerX, y, { align: "center" });

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Folio #${shortId}`, centerX, y, { align: "center" });

      y += 4;
      doc.setLineDashPattern([1, 1], 0);
      doc.line(8, y, 72, y);
      doc.setLineDashPattern([], 0);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const info = [
        `Fecha: ${formatFecha(order?.createdAt)}`,
        `Entrega: ${formatFechaSoloDia(order?.fechaEntrega)}`,
        `Ruta: ${order?.ruta || "Sin ruta"}`,
        `Cliente: ${order?.usuario?.nombre || "Cliente"}`,
        `Estado pedido: ${estadoPedidoTicket(order)}`,
        `Estado pago: ${order?.estadoPago || "Pendiente"}`,
        `Método de pago: ${formatearMetodoPago(order?.metodoPago)}`,
      ];

      info.forEach((line) => {
        const lines = doc.splitTextToSize(line, 62);
        doc.text(lines, 8, y);
        y += lines.length * 4;
      });

      y += 2;
      doc.line(8, y, 72, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.text("PRODUCTOS", 8, y);
      y += 5;

      doc.setFont("helvetica", "normal");

      (order?.items || []).forEach((item) => {
        const nombre = nombreProducto(item);
        const cantidad = formatKg(item?.cantidad || 0);
        const subtotal = formatMXN(item?.subtotal || 0);

        const nombreLineas = doc.splitTextToSize(nombre, 30);
        doc.text(nombreLineas, 8, y);
        doc.text(cantidad, 43, y, { align: "center" });
        doc.text(subtotal, 72, y, { align: "right" });

        y += Math.max(nombreLineas.length * 4, 4) + 2;
      });

      y += 2;
      doc.line(8, y, 72, y);

      y += 7;
      doc.setFontSize(8);
      doc.text("TOTAL", centerX, y, { align: "center" });

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(formatMXN(order?.total || 0), centerX, y, {
        align: "center",
      });

      doc.save(`ticket-chorimalpa-${shortId}.pdf`);
    } catch (error) {
      alert("No se pudo descargar el PDF del ticket");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-lg text-white">
        Cargando entregas...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-5 md:py-6">
      <div className="mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
          🚚 Mis entregas de hoy
        </h1>

        <p className="text-slate-300 text-sm sm:text-base">
          Aquí aparecen los pedidos activos asignados a tu usuario.
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div
            className={`rounded-xl border px-3 py-2 font-semibold ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/10 border-red-500/40 text-red-300"
            }`}
          >
            {isOnline ? "🟢 Con internet" : "🔴 Sin internet"}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300">
            Pendientes por sincronizar:{" "}
            <span className="font-bold text-amber-400">{pendingCount}</span>
          </div>

          <button
            onClick={sincronizarPendientes}
            disabled={!isOnline || pendingCount === 0 || syncing}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 px-3 py-2 font-bold"
          >
            {syncing ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-slate-300 shadow-lg">
          No tienes pedidos asignados para hoy.
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-slate-800 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <span className="font-bold text-lg text-white">
                  Pedido #{pedido._id?.slice(-6)}
                </span>

                <span className="text-2xl sm:text-xl text-amber-400 font-extrabold">
                  {formatMXN(pedido.total)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300 mb-4">
                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700">
                  <p className="mb-1">
                    <span className="font-semibold text-white">Cliente:</span>{" "}
                    {pedido.usuario?.nombre || "Cliente"}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold text-white">Ruta:</span>{" "}
                    {pedido.ruta || "Sin ruta"}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Día:</span>{" "}
                    {pedido.diaRuta || "Sin día"}
                  </p>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700">
                  <p className="mb-1">
                    <span className="font-semibold text-white">Tel:</span>{" "}
                    {pedido.direccion?.telefono || "Sin teléfono"}
                  </p>
                  <p className="mb-1 break-words">
                    <span className="font-semibold text-white">Dirección:</span>{" "}
                    {pedido.direccion?.calle} {pedido.direccion?.numero},{" "}
                    {pedido.direccion?.colonia}, {pedido.direccion?.municipio}
                  </p>
                  <p className="break-words">
                    <span className="font-semibold text-white">Ref:</span>{" "}
                    {pedido.direccion?.referencias || "Sin referencias"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-3 mb-4 border border-slate-700">
                <h3 className="font-bold mb-2 text-white">Productos</h3>

                <div className="space-y-2">
                  {(pedido.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm border-t border-slate-700 py-2 first:border-t-0"
                    >
                      <span className="text-slate-200 break-words">
                        {nombreProducto(item)} — {formatKg(item.cantidad)}
                      </span>

                      <span className="font-semibold text-amber-300">
                        {formatMXN(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
                <button
                  onClick={() => cambiarEstado(pedido._id, "En camino")}
                  disabled={pedido.estado === "En camino"}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                >
                  En camino
                </button>

                <button
                  onClick={() => cambiarPago(pedido._id, "Pagado")}
                  disabled={pedido.estadoPago === "Pagado"}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3 py-3 rounded-xl text-sm font-bold text-slate-900 min-h-[48px]"
                >
                  Marcar pagado
                </button>

                <button
                  onClick={() => cambiarEstado(pedido._id, "Entregado")}
                  className="bg-green-600 hover:bg-green-700 px-3 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                >
                  Entregado
                </button>

                <button
                  onClick={() => setSelectedOrder(pedido)}
                  className="bg-sky-500 hover:bg-sky-600 px-3 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                >
                  Ver ticket
                </button>

                <button
                  onClick={() => imprimirTicket(pedido)}
                  className="bg-emerald-500 hover:bg-emerald-600 px-3 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                >
                  Imprimir
                </button>

                <button
                  onClick={() => descargarPDF(pedido)}
                  className="bg-violet-500 hover:bg-violet-600 px-3 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                >
                  PDF
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-400">
                <span className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2">
                  Estado:{" "}
                  <span className="text-white font-semibold">
                    {pedido.estado}
                  </span>
                </span>

                <span className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2">
                  Pago:{" "}
                  <span className="text-emerald-300 font-semibold">
                    {pedido.estadoPago}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={logoTicketBase64 || logoChoriMalpa}
                  alt="ChoriMalpa"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain grayscale"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">CHORIMALPA</h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    Comprobante de pedido
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-500 hover:text-slate-800 text-3xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <h3 className="font-bold text-lg">
                Folio #{selectedOrder._id?.slice(-6)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Cliente</h4>
                  <p>{selectedOrder.usuario?.nombre || "Sin nombre"}</p>
                  <p className="text-slate-600 break-words">
                    {selectedOrder.usuario?.email || "Sin correo"}
                  </p>
                </div>

                <div className="bg-slate-100 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Estado</h4>
                  <p>
                    <strong>Estado pedido:</strong>{" "}
                    {estadoPedidoTicket(selectedOrder)}
                  </p>
                  <p>
                    <strong>Estado pago:</strong>{" "}
                    {selectedOrder.estadoPago || "Pendiente"}
                  </p>
                  <p>
                    <strong>Método de pago:</strong>{" "}
                    {formatearMetodoPago(selectedOrder.metodoPago)}
                  </p>
                </div>

                <div className="bg-slate-100 rounded-xl p-4 md:col-span-2">
                  <h4 className="font-bold mb-2">Entrega</h4>
                  <p className="break-words">
                    {selectedOrder.direccion?.calle || ""}{" "}
                    {selectedOrder.direccion?.numero || ""}
                  </p>
                  <p className="break-words">
                    {selectedOrder.direccion?.colonia || ""},{" "}
                    {selectedOrder.direccion?.municipio || ""}
                  </p>
                  <p>
                    Tel: {selectedOrder.direccion?.telefono || "Sin teléfono"}
                  </p>
                  <p className="break-words">
                    Ref:{" "}
                    {selectedOrder.direccion?.referencias || "Sin referencias"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Producto</th>
                      <th className="px-4 py-3 text-center">Cantidad (kg)</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(selectedOrder.items || []).map((item, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-4 py-3">{nombreProducto(item)}</td>
                        <td className="px-4 py-3 text-center">
                          {formatKg(item.cantidad)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMXN(item.precioUnitario)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMXN(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right">
                <p className="text-slate-500 text-sm">Total del pedido</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatMXN(selectedOrder.total)}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => imprimirTicket(selectedOrder)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl"
              >
                Imprimir ticket
              </button>

              <button
                onClick={() => descargarPDF(selectedOrder)}
                className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-4 py-3 rounded-xl"
              >
                Descargar PDF
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-3 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}