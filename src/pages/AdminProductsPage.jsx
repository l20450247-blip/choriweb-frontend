// frontend/src/pages/AdminProductsPage.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    disponible: true,
    categoria: "",
    imagen: null,
  });

  const [editingId, setEditingId] = useState(null);

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [prodRes, catRes] = await Promise.all([
          api.get("/productos/getallproducts"),
          api.get("/categorias"),
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

  const handleChange = (e) => {
    const { name, value } = e.target;

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
        const payload = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion,
          precio: Number(form.precio),
          disponible: form.disponible,
          categoria: form.categoria,
        };

        const res = await api.put(`/productos/${editingId}`, payload);

        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? res.data : p))
        );
        setSuccess("Producto actualizado correctamente");
      } else {
        const data = new FormData();
        data.append("nombre", form.nombre.trim());
        data.append("descripcion", form.descripcion);
        data.append("precio", String(form.precio));
        data.append("disponible", String(form.disponible));
        data.append("categoria", form.categoria);
        if (form.imagen) data.append("imagen", form.imagen);

        const res = await api.post("/productos", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

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

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio ?? "",
      disponible: product.disponible,
      categoria: product.categoria?._id || product.categoria || "",
      imagen: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
      await api.delete(`/productos/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el producto");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Administrar productos
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Agrega, edita y administra los productos que aparecen en la tienda.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/60 text-red-100 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-500/60 text-emerald-100 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-6 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold">
              {editingId ? "Editar producto" : "Agregar nuevo producto"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 text-sm font-bold text-amber-300"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className="md:col-span-2"
            />

            <Input
              label="Precio"
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="0.00"
            />

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Disponibilidad
              </label>
              <select
                name="disponible"
                value={form.disponible ? "true" : "false"}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="true">Disponible</option>
                <option value="false">Agotado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Categoría
              </label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
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
                <label className="block text-sm mb-1 text-slate-300">
                  Imagen (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-slate-300">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Descripción breve del producto"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 px-6 py-3 rounded-xl font-bold text-slate-950 min-h-[50px]"
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

        <h2 className="text-2xl font-bold mb-4">Listado de productos</h2>

        {loading ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-300">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-400">
            No hay productos registrados.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto bg-slate-800/70 border border-slate-700 rounded-2xl shadow-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-left">Precio</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t border-slate-700 hover:bg-slate-800/80"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imagen_url && (
                            <img
                              src={p.imagen_url}
                              alt={p.nombre}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <div className="font-bold">{p.nombre}</div>
                            {p.descripcion && (
                              <div className="text-xs text-slate-400 line-clamp-2">
                                {p.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">{p.categoria?.nombre || "—"}</td>
                      <td className="px-4 py-3 font-bold text-amber-400">
                        {formatMXN(p.precio)}
                      </td>

                      <td className="px-4 py-3">
                        {p.disponible ? (
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                            Agotado
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 mr-2 font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-xs px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-lg"
                >
                  <div className="flex gap-3">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-slate-500 shrink-0">
                        Sin imagen
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-lg leading-tight break-words">
                        {p.nombre}
                      </h3>

                      <p className="text-sm text-slate-400 mt-1">
                        {p.categoria?.nombre || "Sin categoría"}
                      </p>

                      <p className="text-xl font-extrabold text-amber-400 mt-1">
                        {formatMXN(p.precio)}
                      </p>
                    </div>
                  </div>

                  {p.descripcion && (
                    <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                      {p.descripcion}
                    </p>
                  )}

                  <div className="mt-3">
                    {p.disponible ? (
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                        Agotado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 font-bold min-h-[48px]"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(p._id)}
                      className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold min-h-[48px]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1 text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
        placeholder={placeholder}
      />
    </div>
  );
}