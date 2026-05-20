import { useEffect, useState } from "react";
import {
  getRouteConfigsRequest,
  createRouteConfigRequest,
  updateRouteConfigRequest,
} from "../api/routeConfigs";
import { getRuterosRequest, createRuteroRequest } from "../api/users";

const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function AdminRoutesPage() {
  const [rutas, setRutas] = useState([]);
  const [ruteros, setRuteros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingRuta, setSavingRuta] = useState(false);
  const [savingRutero, setSavingRutero] = useState(false);

  const [formRuta, setFormRuta] = useState({
    ruta: "",
    diaSemana: "Lunes",
    ruteroDefault: "",
    activa: true,
    notas: "",
  });

  const [formRutero, setFormRutero] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [resRutas, resRuteros] = await Promise.all([
        getRouteConfigsRequest(),
        getRuterosRequest(),
      ]);

      setRutas(resRutas.data || []);
      setRuteros(resRuteros.data?.ruteros || []);
    } catch (error) {
      alert(error.response?.data?.message?.[0] || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleRutaChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormRuta((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRuteroChange = (e) => {
    const { name, value } = e.target;

    setFormRutero((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCrearRutero = async (e) => {
    e.preventDefault();

    if (
      !formRutero.nombre.trim() ||
      !formRutero.email.trim() ||
      !formRutero.password.trim()
    ) {
      alert("Completa nombre, email y contraseña del rutero");
      return;
    }

    try {
      setSavingRutero(true);

      await createRuteroRequest({
        nombre: formRutero.nombre.trim(),
        email: formRutero.email.trim(),
        password: formRutero.password,
      });

      setFormRutero({
        nombre: "",
        email: "",
        password: "",
      });

      await cargarDatos();
      alert("Rutero creado correctamente");
    } catch (error) {
      alert(error.response?.data?.message?.[0] || "Error al crear rutero");
    } finally {
      setSavingRutero(false);
    }
  };

  const handleCrearRuta = async (e) => {
    e.preventDefault();

    if (!formRuta.ruta.trim()) {
      alert("Escribe el nombre de la ruta");
      return;
    }

    try {
      setSavingRuta(true);

      await createRouteConfigRequest({
        ruta: formRuta.ruta.trim(),
        diaSemana: formRuta.diaSemana,
        ruteroDefault: formRuta.ruteroDefault || null,
        activa: formRuta.activa,
        notas: formRuta.notas.trim(),
      });

      setFormRuta({
        ruta: "",
        diaSemana: "Lunes",
        ruteroDefault: "",
        activa: true,
        notas: "",
      });

      await cargarDatos();
      alert("Ruta creada correctamente");
    } catch (error) {
      alert(error.response?.data?.message?.[0] || "Error al crear ruta");
    } finally {
      setSavingRuta(false);
    }
  };

  const actualizarRuta = async (ruta, cambios) => {
    try {
      await updateRouteConfigRequest(ruta._id, cambios);
      await cargarDatos();
    } catch (error) {
      alert(error.response?.data?.message?.[0] || "Error al actualizar ruta");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Configuración de rutas
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Crea ruteros, configura rutas, días de salida y asigna un rutero por
            ruta.
          </p>
        </div>

        <form
          onSubmit={handleCrearRutero}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-400">
            Crear nuevo rutero
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formRutero.nombre}
              onChange={handleRuteroChange}
              placeholder="Ej. Juan Pérez"
              color="emerald"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formRutero.email}
              onChange={handleRuteroChange}
              placeholder="rutero@gmail.com"
              color="emerald"
            />

            <Input
              label="Contraseña"
              name="password"
              type="text"
              value={formRutero.password}
              onChange={handleRuteroChange}
              placeholder="Ej. Rutero123!"
              color="emerald"
            />

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingRutero}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-xl disabled:opacity-50 min-h-[50px]"
              >
                {savingRutero ? "Creando..." : "Crear rutero"}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Guarda esta contraseña y entrégasela al rutero para que pueda
            iniciar sesión.
          </p>
        </form>

        <form
          onSubmit={handleCrearRuta}
          className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-amber-400">
            Crear nueva ruta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              label="Nombre de ruta"
              name="ruta"
              value={formRuta.ruta}
              onChange={handleRutaChange}
              placeholder="Ej. Ruta 4"
              color="amber"
            />

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Día de salida
              </label>
              <select
                name="diaSemana"
                value={formRuta.diaSemana}
                onChange={handleRutaChange}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              >
                {DIAS.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Rutero asignado
              </label>
              <select
                name="ruteroDefault"
                value={formRuta.ruteroDefault}
                onChange={handleRutaChange}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Sin rutero</option>
                {ruteros.map((rutero) => (
                  <option key={rutero._id} value={rutero._id}>
                    {rutero.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Notas"
              name="notas"
              value={formRuta.notas}
              onChange={handleRutaChange}
              placeholder="Ej. Ruta del centro"
              color="amber"
            />

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:items-end">
              <label className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-700 rounded-xl px-3 py-3">
                <input
                  type="checkbox"
                  name="activa"
                  checked={formRuta.activa}
                  onChange={handleRutaChange}
                  className="h-4 w-4"
                />
                Activa
              </label>

              <button
                type="submit"
                disabled={savingRuta}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-3 rounded-xl disabled:opacity-50 min-h-[50px]"
              >
                {savingRuta ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        </form>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold">
              Rutas configuradas
            </h2>
          </div>

          {loading ? (
            <p className="p-5 text-slate-300">Cargando rutas...</p>
          ) : rutas.length === 0 ? (
            <p className="p-5 text-slate-300">No hay rutas configuradas.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm min-w-[850px]">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-5 py-3 text-left">Ruta</th>
                      <th className="px-5 py-3 text-left">Día</th>
                      <th className="px-5 py-3 text-left">Rutero</th>
                      <th className="px-5 py-3 text-left">Estado</th>
                      <th className="px-5 py-3 text-left">Notas</th>
                      <th className="px-5 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rutas.map((ruta) => (
                      <tr key={ruta._id} className="border-t border-slate-700">
                        <td className="px-5 py-3 font-bold text-emerald-400">
                          {ruta.ruta}
                        </td>

                        <td className="px-5 py-3">
                          <select
                            value={ruta.diaSemana}
                            onChange={(e) =>
                              actualizarRuta(ruta, {
                                diaSemana: e.target.value,
                              })
                            }
                            className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2"
                          >
                            {DIAS.map((dia) => (
                              <option key={dia} value={dia}>
                                {dia}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-3">
                          <select
                            value={ruta.ruteroDefault?._id || ""}
                            onChange={(e) =>
                              actualizarRuta(ruta, {
                                ruteroDefault: e.target.value || null,
                              })
                            }
                            className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2"
                          >
                            <option value="">Sin rutero</option>
                            {ruteros.map((rutero) => (
                              <option key={rutero._id} value={rutero._id}>
                                {rutero.nombre}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-3">
                          <EstadoBadge activa={ruta.activa} />
                        </td>

                        <td className="px-5 py-3 text-slate-300">
                          {ruta.notas || "Sin notas"}
                        </td>

                        <td className="px-5 py-3">
                          <button
                            onClick={() =>
                              actualizarRuta(ruta, { activa: !ruta.activa })
                            }
                            className={`px-3 py-2 rounded-lg text-xs font-bold ${
                              ruta.activa
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                            }`}
                          >
                            {ruta.activa ? "Desactivar" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden p-3 space-y-3">
                {rutas.map((ruta) => (
                  <div
                    key={ruta._id}
                    className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-slate-400">Ruta</p>
                        <h3 className="text-xl font-extrabold text-emerald-400">
                          {ruta.ruta}
                        </h3>
                      </div>

                      <EstadoBadge activa={ruta.activa} />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Día
                        </label>
                        <select
                          value={ruta.diaSemana}
                          onChange={(e) =>
                            actualizarRuta(ruta, { diaSemana: e.target.value })
                          }
                          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-3"
                        >
                          {DIAS.map((dia) => (
                            <option key={dia} value={dia}>
                              {dia}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Rutero
                        </label>
                        <select
                          value={ruta.ruteroDefault?._id || ""}
                          onChange={(e) =>
                            actualizarRuta(ruta, {
                              ruteroDefault: e.target.value || null,
                            })
                          }
                          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-3"
                        >
                          <option value="">Sin rutero</option>
                          {ruteros.map((rutero) => (
                            <option key={rutero._id} value={rutero._id}>
                              {rutero.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-3">
                        <p className="text-xs text-slate-400 mb-1">Notas</p>
                        <p className="text-sm text-slate-200">
                          {ruta.notas || "Sin notas"}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          actualizarRuta(ruta, { activa: !ruta.activa })
                        }
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold min-h-[50px] ${
                          ruta.activa
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                        }`}
                      >
                        {ruta.activa ? "Desactivar ruta" : "Activar ruta"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && ruteros.length === 0 && (
            <p className="p-5 text-amber-300 text-sm border-t border-slate-700">
              No tienes ruteros creados todavía. Primero crea usuarios tipo
              rutero.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  color = "amber",
}) {
  const ring =
    color === "emerald"
      ? "focus:ring-emerald-500"
      : "focus:ring-amber-500";

  return (
    <div>
      <label className="block text-sm mb-1 text-slate-300">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 outline-none focus:ring-2 ${ring}`}
      />
    </div>
  );
}

function EstadoBadge({ activa }) {
  return (
    <span
      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border ${
        activa
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          : "bg-red-500/20 text-red-300 border-red-500/40"
      }`}
    >
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}