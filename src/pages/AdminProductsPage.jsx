// frontend/src/pages/AdminProductsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // form para crear / editar
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    disponible: true,
    categoria: "",
    imagen: null, // file
  });

  // si tiene valor => estamos editando
  const [editingId, setEditingId] = useState(null);

  // Cargar productos y categorías al entrar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/productos/getallproducts`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/categorias`, {
            withCredentials: true,
          }),
        ]);

        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar productos o categorías");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ------------------- handlers del formulario -------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    // disponible viene como "true"/"false" cuando es select
    if (name === "disponible") {
      setForm((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imagen: file }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      disponible: true,
      categoria: "",
      imagen: null,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre.trim() || !form.precio || !form.categoria) {
      setError("Nombre, precio y categoría son obligatorios");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        // 🔧 EDITAR (sin cambiar imagen por ahora)
        const payload = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion,
          precio: Number(form.precio),
          disponible: form.disponible,
          categoria: form.categoria,
        };

        const res = await axios.put(
          `${API_URL}/productos/${editingId}`,
          payload,
          { withCredentials: true }
        );

        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data : p))
        );
        setSuccess("Producto actualizado correctamente");
      } else {
        // ➕ CREAR (con imagen a Cloudinary)
        const data = new FormData();
        data.append("nombre", form.nombre.trim());
        data.append("descripcion", form.descripcion);
        data.append("precio", form.precio);
        data.append("disponible", form.disponible);
        data.append("categoria", form.categoria);
        if (form.imagen) data.append("imagen", form.imagen);

        const res = await axios.post(`${API_URL}/productos`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        // agregamos arriba
        setProducts((prev) => [res.data, ...prev]);
        setSuccess("Producto creado correctamente");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(" | ")
          : msg || "Error al guardar el producto"
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------- editar / eliminar -------------------

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio ?? "",
      disponible: product.disponible,
      categoria: product.categoria?._id || product.categoria || "",
      imagen: null, // no tocamos imagen al editar
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
      await axios.delete(`${API_URL}/productos/${id}`, {
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el producto");
    }
  };

  // ------------------- render -------------------

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administrar productos</h1>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 bg-red-500/90 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-emerald-600 text-white px-4 py-2 rounded">
          {success}
        </div>
      )}

      {/* FORMULARIO CREAR / EDITAR */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? "Editar producto" : "Agregar nuevo producto"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Precio</label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Disponibilidad</label>
            <select
              name="disponible"
              value={form.disponible ? "true" : "false"}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            >
              <option value="true">Disponible</option>
              <option value="false">Agotado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm mb-1">Imagen (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              placeholder="Descripción breve del producto"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 px-5 py-2 rounded font-semibold text-slate-900"
            >
              {saving
                ? editingId
                  ? "Guardando cambios..."
                  : "Creando..."
                : editingId
                ? "Guardar cambios"
                : "Crear producto"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE PRODUCTOS */}
      <h2 className="text-xl font-semibold mb-4">Listado de productos</h2>

      {loading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-slate-400">No hay productos registrados.</p>
      ) : (
        <div className="overflow-x-auto bg-slate-800/70 border border-slate-700 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-slate-700 hover:bg-slate-800/80"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {p.imagen_url && (
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{p.nombre}</div>
                        {p.descripcion && (
                          <div className="text-xs text-slate-400 line-clamp-2">
                            {p.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {p.categoria?.nombre || "—"}
                  </td>
                  <td className="px-4 py-2">
                    ${Number(p.precio).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {p.disponible ? (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Agotado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs px-3 py-1 rounded bg-sky-500 hover:bg-sky-600 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-xs px-3 py-1 rounded bg-red-500 hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
