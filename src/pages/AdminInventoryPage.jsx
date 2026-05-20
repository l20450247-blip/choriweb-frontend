// src/pages/AdminInventoryPage.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

function AdminInventoryPage() {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [entradaForm, setEntradaForm] = useState({});
  const [ajusteForm, setAjusteForm] = useState({});
  const [minimoForm, setMinimoForm] = useState({});

  const [loadingEntrada, setLoadingEntrada] = useState({});
  const [loadingAjuste, setLoadingAjuste] = useState({});
  const [loadingMinimo, setLoadingMinimo] = useState({});

  const formatKg = (n) => `${Number(n || 0)} kg`;

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

  const getInventory = async () => {
    const res = await api.get("/inventario");
    setInventario(res.data || []);

    const nuevosMinimos = {};
    (res.data || []).forEach((item) => {
      nuevosMinimos[item.producto._id] = item.stockMinimo ?? 0;
    });

    setMinimoForm(nuevosMinimos);
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
  }, []);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleEntradaChange = (productoId, field, value) => {
    setEntradaForm((prev) => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        [field]: value,
      },
    }));
  };

  const handleAjusteChange = (productoId, field, value) => {
    setAjusteForm((prev) => ({
      ...prev,
      [productoId]: {
        ...prev[productoId],
        [field]: value,
      },
    }));
  };

  const handleMinimoChange = (productoId, value) => {
    setMinimoForm((prev) => ({
      ...prev,
      [productoId]: value,
    }));
  };

  const handleAgregarStock = async (productoId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      setLoadingEntrada((prev) => ({ ...prev, [productoId]: true }));

      const cantidad = entradaForm[productoId]?.cantidad || "";
      const motivo = entradaForm[productoId]?.motivo || "";

      if (!cantidad || Number(cantidad) <= 0) {
        setErrorMsg("La cantidad para agregar stock debe ser mayor a 0 kg.");
        return;
      }

      await api.post("/inventario/entrada", {
        productoId,
        cantidad: Number(cantidad),
        motivo: motivo || "Entrada manual desde inventario",
      });

      setSuccessMsg("Stock agregado correctamente.");
      setEntradaForm((prev) => ({
        ...prev,
        [productoId]: { cantidad: "", motivo: "" },
      }));

      await Promise.all([getInventory(), getMovimientos()]);
    } catch (error) {
      console.error("Error al agregar stock:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo agregar stock"
      );
    } finally {
      setLoadingEntrada((prev) => ({ ...prev, [productoId]: false }));
    }
  };

  const handleAjustarStock = async (productoId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      setLoadingAjuste((prev) => ({ ...prev, [productoId]: true }));

      const nuevoStock = ajusteForm[productoId]?.nuevoStock || "";
      const motivo = ajusteForm[productoId]?.motivo || "";

      if (nuevoStock === "" || Number(nuevoStock) < 0) {
        setErrorMsg("El nuevo stock debe ser un número mayor o igual a 0 kg.");
        return;
      }

      await api.post("/inventario/ajuste", {
        productoId,
        nuevoStock: Number(nuevoStock),
        motivo: motivo || "Ajuste manual desde inventario",
      });

      setSuccessMsg("Inventario ajustado correctamente.");
      setAjusteForm((prev) => ({
        ...prev,
        [productoId]: { nuevoStock: "", motivo: "" },
      }));

      await Promise.all([getInventory(), getMovimientos()]);
    } catch (error) {
      console.error("Error al ajustar stock:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo ajustar el inventario"
      );
    } finally {
      setLoadingAjuste((prev) => ({ ...prev, [productoId]: false }));
    }
  };

  const handleGuardarMinimo = async (productoId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      setLoadingMinimo((prev) => ({ ...prev, [productoId]: true }));

      const stockMinimo = minimoForm[productoId];

      if (stockMinimo === "" || stockMinimo == null || Number(stockMinimo) < 0) {
        setErrorMsg("El stock mínimo debe ser un número mayor o igual a 0 kg.");
        return;
      }

      await api.put(`/inventario/${productoId}/minimo`, {
        stockMinimo: Number(stockMinimo),
      });

      setSuccessMsg("Stock mínimo actualizado correctamente.");
      await getInventory();
    } catch (error) {
      console.error("Error al actualizar stock mínimo:", error);
      setErrorMsg(
        error?.response?.data?.message?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo actualizar el stock mínimo"
      );
    } finally {
      setLoadingMinimo((prev) => ({ ...prev, [productoId]: false }));
    }
  };

  const getTipoClase = (tipo) => {
    if (tipo === "entrada") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }

    if (tipo === "salida") {
      return "bg-red-500/20 text-red-300 border-red-500/40";
    }

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
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Inventario
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Consulta y administra el stock actual de los productos registrados
            en kilogramos.
          </p>
        </div>

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
          <div className="space-y-8">
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
                      <tr
                        key={item._id}
                        className="border-b border-slate-700 hover:bg-slate-700/40 transition"
                      >
                        <td className="p-4 font-semibold text-base md:text-lg">
                          {item.producto?.nombre || "Sin nombre"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xl md:text-2xl font-bold ${
                              stockBajo ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {formatKg(item.stockActual)}
                          </span>
                        </td>

                        <td className="p-4 text-base md:text-lg">
                          {formatKg(item.stockMinimo)}
                        </td>

                        <td className="p-4">
                          <StockBadge stockBajo={stockBajo} />
                        </td>

                        <td className="p-4 text-slate-300">
                          {formatFecha(item.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {inventario.map((item) => {
                const stockBajo = item.stockActual <= item.stockMinimo;

                return (
                  <div
                    key={item._id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-slate-400">Producto</p>
                        <h2 className="text-xl font-extrabold text-white leading-tight">
                          {item.producto?.nombre || "Sin nombre"}
                        </h2>
                      </div>

                      <StockBadge stockBajo={stockBajo} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">
                          Stock actual
                        </p>
                        <p
                          className={`text-2xl font-extrabold ${
                            stockBajo ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {formatKg(item.stockActual)}
                        </p>
                      </div>

                      <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">
                          Stock mínimo
                        </p>
                        <p className="text-2xl font-extrabold text-white">
                          {formatKg(item.stockMinimo)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Última actualización: {formatFecha(item.updatedAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inventario.map((item) => {
                const stockBajo = item.stockActual <= item.stockMinimo;

                return (
                  <div
                    key={item._id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {item.producto?.nombre || "Sin nombre"}
                        </h2>

                        <p className="text-slate-400 mt-1 text-sm">
                          Última actualización: {formatFecha(item.updatedAt)}
                        </p>
                      </div>

                      <StockBadge stockBajo={stockBajo} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-400 text-sm mb-1">
                          Stock actual
                        </p>

                        <p
                          className={`text-2xl md:text-3xl font-bold ${
                            stockBajo ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {formatKg(item.stockActual)}
                        </p>
                      </div>

                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-400 text-sm mb-1">
                          Stock mínimo
                        </p>

                        <p className="text-2xl md:text-3xl font-bold text-white">
                          {formatKg(item.stockMinimo)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 bg-slate-900 rounded-xl p-4 border border-slate-700 shadow">
                      <h3 className="font-bold text-violet-400 mb-3 text-lg">
                        Stock mínimo
                      </h3>

                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Stock mínimo en kg"
                          value={minimoForm[item.producto._id] ?? ""}
                          onChange={(e) =>
                            handleMinimoChange(
                              item.producto._id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
                        />

                        <button
                          onClick={() => handleGuardarMinimo(item.producto._id)}
                          disabled={loadingMinimo[item.producto._id]}
                          className="w-full md:w-auto bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl transition min-h-[50px]"
                        >
                          {loadingMinimo[item.producto._id]
                            ? "Guardando..."
                            : "Guardar mínimo"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 shadow">
                        <h3 className="font-bold text-amber-400 mb-3 text-lg">
                          Agregar stock
                        </h3>

                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          placeholder="Cantidad en kg"
                          value={
                            entradaForm[item.producto._id]?.cantidad || ""
                          }
                          onChange={(e) =>
                            handleEntradaChange(
                              item.producto._id,
                              "cantidad",
                              e.target.value
                            )
                          }
                          className="w-full mb-3 rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                        />

                        <input
                          type="text"
                          placeholder="Motivo"
                          value={entradaForm[item.producto._id]?.motivo || ""}
                          onChange={(e) =>
                            handleEntradaChange(
                              item.producto._id,
                              "motivo",
                              e.target.value
                            )
                          }
                          className="w-full mb-3 rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                        />

                        <button
                          onClick={() => handleAgregarStock(item.producto._id)}
                          disabled={loadingEntrada[item.producto._id]}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition min-h-[50px]"
                        >
                          {loadingEntrada[item.producto._id]
                            ? "Agregando..."
                            : "Agregar"}
                        </button>
                      </div>

                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 shadow">
                        <h3 className="font-bold text-sky-400 mb-3 text-lg">
                          Ajustar stock
                        </h3>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Nuevo stock en kg"
                          value={
                            ajusteForm[item.producto._id]?.nuevoStock || ""
                          }
                          onChange={(e) =>
                            handleAjusteChange(
                              item.producto._id,
                              "nuevoStock",
                              e.target.value
                            )
                          }
                          className="w-full mb-3 rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                        />

                        <input
                          type="text"
                          placeholder="Motivo"
                          value={ajusteForm[item.producto._id]?.motivo || ""}
                          onChange={(e) =>
                            handleAjusteChange(
                              item.producto._id,
                              "motivo",
                              e.target.value
                            )
                          }
                          className="w-full mb-3 rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                        />

                        <button
                          onClick={() => handleAjustarStock(item.producto._id)}
                          disabled={loadingAjuste[item.producto._id]}
                          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition min-h-[50px]"
                        >
                          {loadingAjuste[item.producto._id]
                            ? "Ajustando..."
                            : "Ajustar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-lg">
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Movimientos de inventario
                </h2>

                <p className="text-slate-400 mt-1 text-sm md:text-base">
                  Historial de entradas, salidas y ajustes en kilogramos.
                </p>
              </div>

              {movimientos.length === 0 ? (
                <div className="bg-slate-900 rounded-xl p-4 text-slate-300 border border-slate-700">
                  No hay movimientos registrados todavía.
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700 max-h-[420px] overflow-y-auto">
                    <table className="min-w-[900px] w-full bg-slate-900 text-white">
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
                          <tr
                            key={mov._id}
                            className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                          >
                            <td className="p-4 font-medium">
                              {mov.producto?.nombre || "Sin producto"}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTipoClase(
                                  mov.tipo
                                )}`}
                              >
                                {mov.tipo}
                              </span>
                            </td>

                            <td className="p-4 font-semibold">
                              {formatKg(mov.cantidad)}
                            </td>

                            <td className="p-4 text-slate-300">
                              {mov.motivo || "Sin motivo"}
                            </td>

                            <td className="p-4 text-slate-300">
                              {mov.usuario?.nombre || "Sin usuario"}
                            </td>

                            <td className="p-4 text-slate-300">
                              {formatFecha(mov.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {movimientos.map((mov) => (
                      <div
                        key={mov._id}
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs text-slate-400">Producto</p>
                            <h3 className="font-bold text-white">
                              {mov.producto?.nombre || "Sin producto"}
                            </h3>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getTipoClase(
                              mov.tipo
                            )}`}
                          >
                            {mov.tipo}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                            <p className="text-xs text-slate-400">Cantidad</p>
                            <p className="font-extrabold text-amber-400">
                              {formatKg(mov.cantidad)}
                            </p>
                          </div>

                          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                            <p className="text-xs text-slate-400">Usuario</p>
                            <p className="font-semibold text-slate-200">
                              {mov.usuario?.nombre || "Sin usuario"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 mb-3">
                          <p className="text-xs text-slate-400">Motivo</p>
                          <p className="text-sm text-slate-200">
                            {mov.motivo || "Sin motivo"}
                          </p>
                        </div>

                        <p className="text-xs text-slate-500">
                          {formatFecha(mov.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
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

export default AdminInventoryPage;