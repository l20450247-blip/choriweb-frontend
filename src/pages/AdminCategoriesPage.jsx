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
        error.response?.data?.message?.[0] ||
        "Error al guardar la categoría";
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administrar categorías</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editando ? "Editar categoría" : "Agregar nueva categoría"}
          </h2>

          {errorMsg && (
            <div className="mb-4 bg-red-500 text-white px-3 py-2 rounded text-sm">
              {errorMsg}
            </div>
          )}

          {okMsg && (
            <div className="mb-4 bg-emerald-500 text-white px-3 py-2 rounded text-sm">
              {okMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-slate-700"
                placeholder="Nombre de la categoría"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Descripción</label>
              <textarea
                className="w-full p-2 rounded bg-slate-700"
                placeholder="Descripción breve (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Guardando..."
                  : editando
                  ? "Actualizar categoría"
                  : "Crear categoría"}
              </button>

              {editando && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-sm"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de categorías */}
        <div className="bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            Listado de categorías
          </h2>

          {categories.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No hay categorías registradas.
            </p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{cat.nombre}</div>
                    {cat.descripcion && (
                      <div className="text-xs text-slate-400">
                        {cat.descripcion}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
