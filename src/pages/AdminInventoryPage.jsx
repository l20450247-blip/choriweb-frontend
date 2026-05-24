// src/pages/AdminInventoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";

export default function AdminInventoryPage() {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [accionActiva, setAccionActiva] = useState("entrada");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [minimo, setMinimo] = useState("");
  const [entradaCantidad, setEntradaCantidad] = useState("");
  const [entradaMotivo, setEntradaMotivo] = useState("");
  const [ajusteStock, setAjusteStock] = useState("");
  const [ajusteMotivo, setAjusteMotivo] = useState("");

  const [savingMinimo, setSavingMinimo] = useState(false);
  const [savingEntrada, setSavingEntrada] = useState(false);
  const [savingAjuste, setSavingAjuste] = useState(false);

  const formatKg = (n) => `${Number(n || 0).toLocaleString("es-MX")} kg`;

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Fecha inválida";

    return d.toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const productoSeleccionado = useMemo(() => {
    return inventario.find((item) => item.producto?._id === productoSeleccionadoId);
  }, [inventario, productoSeleccionadoId]);

  const resumen = useMemo(() => {
    const totalProductos = inventario.length;
    const stockTotal = inventario.reduce(
      (sum, item) => sum + Number(item.stockActual || 0),
      0
    );
    const bajoStock = inventario.filter(
      (item) => Number(item.stockActual || 0) <= Number(item.stockMinimo || 0)
    ).length;

    return { totalProductos, stockTotal, bajoStock };
  }, [inventario]);

  const getInventory = async () => {
    const res = await api.get("/inventario");
    const data = res.data || [];
    setInventario(data);

    if (!productoSeleccionadoId && data.length > 0) {
      setProductoSeleccionadoId(data[0].producto?._id || "");
      setMinimo(data[0].stockMinimo ?? 0);
    }
  };

  const getMovimientos = async () => {
    const res = await api.get("/inventario/movimientos");
    setMovimientos(res.data || []);
  };

  const cargarDatos = async () => {
    try {
      setErrorMsg("");
      await Promise.all([getInventory(), getMovimientos()]);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo cargar el inventario"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  useEffect(() => {
    if (!productoSeleccionado) return;
    setMinimo(productoSeleccionado.stockMinimo ?? 0);
    setEntradaCantidad("");
    setEntradaMotivo("");
    setAjusteStock("");
    setAjusteMotivo("");
  }, [productoSeleccionado]);

  const handleGuardarMinimo = async () => {
    if (!productoSeleccionadoId) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setSavingMinimo(true);

      if (minimo === "" || minimo == null || Number(minimo) < 0) {
        setErrorMsg("El stock mínimo debe ser mayor o igual a 0 kg.");
        return;
      }

      await api.put(`/inventario/${productoSeleccionadoId}/minimo`, {
        stockMinimo: Number(minimo),
      });

      setSuccessMsg("Stock mínimo actualizado correctamente.");
      await getInventory();
    } catch (error) {
      console.error("Error al actualizar mínimo:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          "No se pudo actualizar el stock mínimo"
      );
    } finally {
      setSavingMinimo(false);
    }
  };

  const handleAgregarStock = async () => {
    if (!productoSeleccionadoId) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setSavingEntrada(true);

      if (!entradaCantidad || Number(entradaCantidad) <= 0) {
        setErrorMsg("La cantidad para agregar stock debe ser mayor a 0 kg.");
        return;
      }

      await api.post("/inventario/entrada", {
        productoId: productoSeleccionadoId,
        cantidad: Number(entradaCantidad),
        motivo: entradaMotivo || "Entrada manual desde inventario",
      });

      setSuccessMsg("Stock agregado correctamente.");
      setEntradaCantidad("");
      setEntradaMotivo("");

      await Promise.all([getInventory(), getMovimientos()]);
    } catch (error) {
      console.error("Error al agregar stock:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          "No se pudo agregar stock"
      );
    } finally {
      setSavingEntrada(false);
    }
  };

  const handleAjustarStock = async () => {
    if (!productoSeleccionadoId) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setSavingAjuste(true);

      if (ajusteStock === "" || Number(ajusteStock) < 0) {
        setErrorMsg("El nuevo stock debe ser mayor o igual a 0 kg.");
        return;
      }

      await api.post("/inventario/ajuste", {
        productoId: productoSeleccionadoId,
        nuevoStock: Number(ajusteStock),
        motivo: ajusteMotivo || "Ajuste manual desde inventario",
      });

      setSuccessMsg("Inventario ajustado correctamente.");
      setAjusteStock("");
      setAjusteMotivo("");

      await Promise.all([getInventory(), getMovimientos()]);
    } catch (error) {
      console.error("Error al ajustar stock:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          "No se pudo ajustar el inventario"
      );
    } finally {
      setSavingAjuste(false);
    }
  };

  const getTipoClase = (tipo) => {
    if (tipo === "entrada") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (tipo === "salida") return "bg-red-500/20 text-red-300 border-red-500/40";
    return "bg-sky-500/20 text-sky-300 border-sky-500/40";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <p className="text-white text-lg">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/60 p-4 text-red-200 shadow-lg text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/60 p-4 text-emerald-200 shadow-lg text-sm">
            {successMsg}
          </div>
        )}

        {inventario.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-6 text-slate-300 shadow-lg border border-slate-700 text-center">
            No hay productos en inventario todavía.
          </div>
        ) : (
          <div className="space-y-6">
            <DashboardResumen resumen={resumen} formatKg={formatKg} />

            <InventarioDesktop
              inventario={inventario}
              formatKg={formatKg}
              formatFecha={formatFecha}
            />

            <InventarioMobile
              inventario={inventario}
              productoSeleccionadoId={productoSeleccionadoId}
              setProductoSeleccionadoId={setProductoSeleccionadoId}
              formatKg={formatKg}
            />

            <PanelAcciones
              inventario={inventario}
              productoSeleccionado={productoSeleccionado}
              productoSeleccionadoId={productoSeleccionadoId}
              setProductoSeleccionadoId={setProductoSeleccionadoId}
              accionActiva={accionActiva}
              setAccionActiva={setAccionActiva}
              minimo={minimo}
              setMinimo={setMinimo}
              entradaCantidad={entradaCantidad}
              setEntradaCantidad={setEntradaCantidad}
              entradaMotivo={entradaMotivo}
              setEntradaMotivo={setEntradaMotivo}
              ajusteStock={ajusteStock}
              setAjusteStock={setAjusteStock}
              ajusteMotivo={ajusteMotivo}
              setAjusteMotivo={setAjusteMotivo}
              handleGuardarMinimo={handleGuardarMinimo}
              handleAgregarStock={handleAgregarStock}
              handleAjustarStock={handleAjustarStock}
              savingMinimo={savingMinimo}
              savingEntrada={savingEntrada}
              savingAjuste={savingAjuste}
              formatKg={formatKg}
            />

            <Movimientos
              movimientos={movimientos}
              getTipoClase={getTipoClase}
              formatKg={formatKg}
              formatFecha={formatFecha}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Inventario</h1>
      <p className="text-slate-300 text-sm sm:text-base">
        Controla stock, entradas, ajustes y movimientos de productos.
      </p>
    </div>
  );
}

function DashboardResumen({ resumen, formatKg }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <ResumenCard title="Productos" value={resumen.totalProductos} color="text-amber-400" />
      <ResumenCard title="Stock total" value={formatKg(resumen.stockTotal)} color="text-emerald-400" />
      <ResumenCard title="Bajo stock" value={resumen.bajoStock} color={resumen.bajoStock > 0 ? "text-red-400" : "text-sky-400"} />
    </div>
  );
}

function ResumenCard({ title, value, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-lg">
      <p className="text-[11px] sm:text-sm text-slate-400 font-semibold">{title}</p>
      <p className={`text-lg sm:text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function InventarioDesktop({ inventario, formatKg, formatFecha }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-700 shadow-lg">
      <table className="min-w-[850px] w-full bg-slate-800 text-white">
        <thead>
          <tr className="bg-slate-700 text-left">
            <th className="p-4">Producto</th>
            <th className="p-4">Stock actual</th>
            <th className="p-4">Stock mínimo</th>
            <th className="p-4">Estado</th>
            <th className="p-4">Última actualización</th>
          </tr>
        </thead>

        <tbody>
          {inventario.map((item) => {
            const stockBajo = item.stockActual <= item.stockMinimo;

            return (
              <tr key={item._id} className="border-b border-slate-700 hover:bg-slate-700/40 transition">
                <td className="p-4 font-semibold text-lg">{item.producto?.nombre || "Sin nombre"}</td>
                <td className="p-4">
                  <span className={`text-2xl font-bold ${stockBajo ? "text-red-400" : "text-emerald-400"}`}>
                    {formatKg(item.stockActual)}
                  </span>
                </td>
                <td className="p-4 text-lg">{formatKg(item.stockMinimo)}</td>
                <td className="p-4"><StockBadge stockBajo={stockBajo} /></td>
                <td className="p-4 text-slate-300">{formatFecha(item.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InventarioMobile({ inventario, productoSeleccionadoId, setProductoSeleccionadoId, formatKg }) {
  return (
    <div className="md:hidden space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Productos</h2>
        <span className="text-xs text-slate-400">Toca para administrar</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {inventario.map((item) => {
          const id = item.producto?._id;
          const activo = id === productoSeleccionadoId;
          const stockBajo = item.stockActual <= item.stockMinimo;

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => setProductoSeleccionadoId(id)}
              className={`w-full text-left rounded-2xl p-4 border shadow-lg transition active:scale-[0.99] ${
                activo ? "bg-slate-800 border-amber-400" : "bg-slate-800/80 border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold leading-tight truncate">
                    {item.producto?.nombre || "Sin nombre"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Mínimo: {formatKg(item.stockMinimo)}
                  </p>
                </div>

                <StockBadge stockBajo={stockBajo} />
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">Stock actual</p>
                  <p className={`text-2xl font-extrabold ${stockBajo ? "text-red-400" : "text-emerald-400"}`}>
                    {formatKg(item.stockActual)}
                  </p>
                </div>

                {activo && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold">
                    Seleccionado
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PanelAcciones({
  inventario,
  productoSeleccionado,
  productoSeleccionadoId,
  setProductoSeleccionadoId,
  accionActiva,
  setAccionActiva,
  minimo,
  setMinimo,
  entradaCantidad,
  setEntradaCantidad,
  entradaMotivo,
  setEntradaMotivo,
  ajusteStock,
  setAjusteStock,
  ajusteMotivo,
  setAjusteMotivo,
  handleGuardarMinimo,
  handleAgregarStock,
  handleAjustarStock,
  savingMinimo,
  savingEntrada,
  savingAjuste,
  formatKg,
}) {
  const stockBajo = productoSeleccionado?.stockActual <= productoSeleccionado?.stockMinimo;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold">Administrar stock</h2>
        <p className="text-slate-400 text-sm mt-1">
          Selecciona un producto y elige la acción a realizar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <label className="block text-sm font-bold text-slate-300 mb-2">Producto</label>

          <select
            value={productoSeleccionadoId}
            onChange={(e) => setProductoSeleccionadoId(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
          >
            {inventario.map((item) => (
              <option key={item._id} value={item.producto?._id}>
                {item.producto?.nombre || "Sin nombre"}
              </option>
            ))}
          </select>

          {productoSeleccionado && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-extrabold">
                  {productoSeleccionado.producto?.nombre || "Sin nombre"}
                </h3>
                <StockBadge stockBajo={stockBajo} />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <MiniStat title="Actual" value={formatKg(productoSeleccionado.stockActual)} danger={stockBajo} />
                <MiniStat title="Mínimo" value={formatKg(productoSeleccionado.stockMinimo)} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <TabButton active={accionActiva === "entrada"} onClick={() => setAccionActiva("entrada")}>
              Agregar
            </TabButton>
            <TabButton active={accionActiva === "ajuste"} onClick={() => setAccionActiva("ajuste")}>
              Ajustar
            </TabButton>
            <TabButton active={accionActiva === "minimo"} onClick={() => setAccionActiva("minimo")}>
              Mínimo
            </TabButton>
          </div>

          {accionActiva === "entrada" && (
            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-emerald-400">Agregar stock</h3>
              <input className="input-inv" type="number" min="1" step="0.5" placeholder="Cantidad en kg" value={entradaCantidad} onChange={(e) => setEntradaCantidad(e.target.value)} />
              <input className="input-inv" type="text" placeholder="Motivo opcional" value={entradaMotivo} onChange={(e) => setEntradaMotivo(e.target.value)} />
              <button type="button" onClick={handleAgregarStock} disabled={savingEntrada} className="btn-inv bg-emerald-500 hover:bg-emerald-600">
                {savingEntrada ? "Agregando..." : "Agregar stock"}
              </button>
            </div>
          )}

          {accionActiva === "ajuste" && (
            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-sky-400">Ajustar stock</h3>
              <input className="input-inv" type="number" min="0" step="0.5" placeholder="Nuevo stock total en kg" value={ajusteStock} onChange={(e) => setAjusteStock(e.target.value)} />
              <input className="input-inv" type="text" placeholder="Motivo opcional" value={ajusteMotivo} onChange={(e) => setAjusteMotivo(e.target.value)} />
              <button type="button" onClick={handleAjustarStock} disabled={savingAjuste} className="btn-inv bg-sky-500 hover:bg-sky-600">
                {savingAjuste ? "Ajustando..." : "Ajustar stock"}
              </button>
            </div>
          )}

          {accionActiva === "minimo" && (
            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-violet-400">Cambiar mínimo</h3>
              <input className="input-inv" type="number" min="0" placeholder="Stock mínimo en kg" value={minimo} onChange={(e) => setMinimo(e.target.value)} />
              <button type="button" onClick={handleGuardarMinimo} disabled={savingMinimo} className="btn-inv bg-violet-500 hover:bg-violet-600">
                {savingMinimo ? "Guardando..." : "Guardar mínimo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ title, value, danger = false }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className={`text-xl font-extrabold ${danger ? "text-red-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-3 text-xs sm:text-sm font-extrabold transition active:scale-95 ${
        active
          ? "bg-amber-500 text-slate-950"
          : "bg-slate-800 text-slate-300 border border-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Movimientos({ movimientos, getTipoClase, formatKg, formatFecha }) {
  const limpiarMotivo = (motivo = "") => {
    if (!motivo) return "Sin motivo";
    if (motivo.length > 45) return `${motivo.slice(0, 45)}...`;
    return motivo;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold">Movimientos</h2>
        <p className="text-slate-400 mt-1 text-sm">Últimos cambios del inventario.</p>
      </div>

      {movimientos.length === 0 ? (
        <div className="bg-slate-900 rounded-xl p-4 text-slate-300 border border-slate-700">
          No hay movimientos registrados todavía.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700 max-h-[420px] overflow-y-auto">
            <table className="min-w-[900px] w-full bg-slate-900">
              <thead className="sticky top-0 bg-slate-700">
                <tr className="text-left">
                  <th className="p-4">Producto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Cantidad</th>
                  <th className="p-4">Motivo</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                    <td className="p-4 font-medium">{mov.producto?.nombre || "Sin producto"}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTipoClase(mov.tipo)}`}>{mov.tipo}</span></td>
                    <td className="p-4 font-semibold">{formatKg(mov.cantidad)}</td>
                    <td className="p-4 text-slate-300">{limpiarMotivo(mov.motivo)}</td>
                    <td className="p-4 text-slate-300">{mov.usuario?.nombre || "Sin usuario"}</td>
                    <td className="p-4 text-slate-300">{formatFecha(mov.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {movimientos.slice(0, 12).map((mov) => (
              <div key={mov._id} className="bg-slate-900 border border-slate-700 rounded-2xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{mov.producto?.nombre || "Sin producto"}</h3>
                    <p className="text-xs text-slate-400 mt-1">{formatFecha(mov.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTipoClase(mov.tipo)}`}>
                    {mov.tipo}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Cantidad</p>
                    <p className="text-lg font-extrabold text-amber-400">{formatKg(mov.cantidad)}</p>
                  </div>
                  <p className="text-xs text-slate-500 text-right max-w-[55%] line-clamp-2">
                    {limpiarMotivo(mov.motivo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StockBadge({ stockBajo }) {
  return stockBajo ? (
    <span className="inline-block text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-full font-bold">
      Bajo
    </span>
  ) : (
    <span className="inline-block text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full font-bold">
      Estable
    </span>
  );
}