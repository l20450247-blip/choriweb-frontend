// src/pages/AdminCategoriesPage.jsx
import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const loadCategories = async () => {
    try {
      setErrorMsg("");
      const res = await api.get("/categorias");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al cargar categorías");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setEditando(null);
    setErrorMsg("");
    setOkMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setOkMsg("");

    try {
      const payload = { nombre, descripcion };

      if (editando) {
        await api.put(`/categorias/${editando._id}`, payload);
        setOkMsg("Categoría actualizada correctamente");
      } else {
        await api.post("/categorias", payload);
        setOkMsg("Categoría creada correctamente");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message?.[0] || "Error al guardar la categoría";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditando(cat);
    setNombre(cat.nombre || "");
    setDescripcion(cat.descripcion || "");
    setErrorMsg("");
    setOkMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la categoría "${cat.nombre}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setOkMsg("");

    try {
      await api.delete(`/categorias/${cat._id}`);
      setOkMsg("Categoría eliminada correctamente");
      await loadCategories();
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message?.[0] ||
        "Error al eliminar la categoría";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Administrar categorías
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Agrega, edita y administra las categorías de productos de la tienda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold">
                {editando ? "Editar categoría" : "Agregar nueva categoría"}
              </h2>

              {editando && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl text-sm font-bold text-amber-300"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-500/20 border border-red-500/60 text-red-100 px-4 py-3 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            {okMsg && (
              <div className="mb-4 bg-emerald-500/20 border border-emerald-500/60 text-emerald-100 px-4 py-3 rounded-xl text-sm">
                {okMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-300">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Nombre de la categoría"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-300">
                  Descripción
                </label>
                <textarea
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Descripción breve (opcional)"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-xl font-bold text-slate-950 disabled:opacity-60 min-h-[50px]"
              >
                {loading
                  ? "Guardando..."
                  : editando
                  ? "Actualizar categoría"
                  : "Crear categoría"}
              </button>
            </form>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Listado de categorías
            </h2>

            {categories.length === 0 ? (
              <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-5 text-center text-slate-400 text-sm">
                No hay categorías registradas.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4"
                  >
                    <div className="mb-3">
                      <h3 className="font-extrabold text-lg text-white break-words">
                        {cat.nombre}
                      </h3>

                      {cat.descripcion && (
                        <p className="text-sm text-slate-400 mt-1 break-words">
                          {cat.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(cat)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold min-h-[48px]"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}