// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext";
import { createOrderRequest } from "../api/orders.js";

export default function CartPage() {
  const { cart, loading, errorMsg, okMsg, clearCart, loadCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("Zacatecas");
  const [cp, setCp] = useState("");
  const [telefono, setTelefono] = useState("");
  const [referencias, setReferencias] = useState("");
  const [metodoPago, setMetodoPago] = useState("pago_en_entrega");
  const [creatingOrder, setCreatingOrder] = useState(false);

  const hasItems = cart?.items && cart.items.length > 0;

  useEffect(() => {
    if (!user) return;

    setTelefono(user.telefono || "");
    setCalle(user.direccion?.calle || "");
    setNumero(user.direccion?.numero || "");
    setColonia(user.direccion?.colonia || "");
    setMunicipio(user.direccion?.municipio || "");
    setEstado(user.direccion?.estado || "Zacatecas");
    setCp(user.direccion?.cp || "");
    setReferencias(user.direccion?.referencias || "");
  }, [user]);

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  const total =
    cart?.total ||
    cart?.items?.reduce(
      (sum, item) =>
        sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
      0
    ) ||
    0;

  const handleCrearPedido = async () => {
    if (!hasItems) {
      alert("Tu carrito está vacío");
      return;
    }

    if (
      !calle.trim() ||
      !numero.trim() ||
      !colonia.trim() ||
      !municipio.trim() ||
      !estado.trim() ||
      !cp.trim() ||
      !telefono.trim()
    ) {
      alert(
        "Completa calle, número, colonia, municipio, estado, código postal y teléfono."
      );
      return;
    }

    try {
      setCreatingOrder(true);

      const items = cart.items.map((item) => {
        const precioUnitario = Number(item.precio) || 0;
        const cantidad = Number(item.cantidad) || 0;

        return {
          producto: item.producto || item.productoId || item._id,
          cantidad,
          precioUnitario,
          subtotal: precioUnitario * cantidad,
        };
      });

      const payload = {
        items,
        metodoPago,
        direccion: {
          calle: calle.trim(),
          numero: numero.trim(),
          colonia: colonia.trim(),
          municipio: municipio.trim(),
          estado: estado.trim(),
          cp: cp.trim(),
          telefono: telefono.trim(),
          referencias: referencias.trim(),
        },
      };

      await createOrderRequest(payload);

      alert("Pedido creado correctamente");

      await clearCart();
      await loadCart();

      navigate("/mis-pedidos");
    } catch (error) {
      const msg =
        error.response?.data?.message?.[0] ||
        error.response?.data?.message ||
        "Error al crear pedido";

      alert(msg);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleVaciar = async () => {
    if (!hasItems) return;

    const ok = confirm("¿Seguro que quieres vaciar el carrito?");
    if (!ok) return;

    await clearCart();
    await loadCart();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-4 md:px-6 py-5 md:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Mi carrito
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            Revisa tus productos, confirma tu dirección y realiza tu pedido.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/60 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {okMsg && (
          <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/60 px-4 py-3 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        {loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center text-slate-300">
            Cargando carrito...
          </div>
        )}

        {!hasItems && !loading && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-300 shadow-lg">
            <p className="text-xl font-bold mb-2">Tu carrito está vacío</p>
            <p className="text-sm text-slate-400">
              Agrega productos desde la tienda para realizar tu pedido.
            </p>
          </div>
        )}

        {hasItems && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6 items-start">
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Productos agregados</h2>

                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/90">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-center font-semibold">
                          Cantidad (kg)
                        </th>
                        <th className="px-6 py-3 text-right font-semibold">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-right font-semibold">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {cart.items.map((item) => (
                        <tr
                          key={item.productoId || item.producto || item._id}
                          className="border-t border-slate-700/60"
                        >
                          <td className="px-6 py-3">
                            {item.nombre || "Producto"}
                          </td>

                          <td className="px-6 py-3 text-center">
                            {item.cantidad} kg
                          </td>

                          <td className="px-6 py-3 text-right">
                            {formatMXN(item.precio)}
                          </td>

                          <td className="px-6 py-3 text-right font-semibold text-amber-300">
                            {formatMXN(
                              (Number(item.precio) || 0) *
                                (Number(item.cantidad) || 0)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {cart.items.map((item) => {
                    const subtotal =
                      (Number(item.precio) || 0) *
                      (Number(item.cantidad) || 0);

                    return (
                      <div
                        key={item.productoId || item.producto || item._id}
                        className="bg-slate-900/70 border border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-white text-lg">
                              {item.nombre || "Producto"}
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                              {item.cantidad} kg x {formatMXN(item.precio)}
                            </p>
                          </div>

                          <span className="font-extrabold text-amber-400 text-lg whitespace-nowrap">
                            {formatMXN(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg">
                <p className="text-sm text-slate-400">Total del pedido</p>

                <p className="text-4xl font-extrabold text-amber-400 mt-1">
                  {formatMXN(total)}
                </p>

                {user?.rutaHabitual && (
                  <p className="mt-3 text-sm text-slate-300">
                    Ruta asignada:{" "}
                    <span className="font-semibold text-emerald-400">
                      {user.rutaHabitual}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 sm:px-5 py-5 shadow-lg">
              <h2 className="font-bold mb-2 text-xl">Datos del pedido</h2>

              <p className="text-sm text-slate-300 mb-4">
                Tus datos se llenan automáticamente si ya los registraste.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Calle"
                  value={calle}
                  onChange={setCalle}
                  placeholder="Ej. Calle del Arco"
                />

                <Input
                  label="Número"
                  value={numero}
                  onChange={setNumero}
                  placeholder="Ej. 10"
                />

                <Input
                  label="Colonia"
                  value={colonia}
                  onChange={setColonia}
                  placeholder="Ej. Centro"
                />

                <Input
                  label="Municipio"
                  value={municipio}
                  onChange={setMunicipio}
                  placeholder="Ej. Villanueva"
                />

                <Input
                  label="Estado"
                  value={estado}
                  onChange={setEstado}
                  placeholder="Ej. Zacatecas"
                />

                <Input
                  label="Código postal"
                  value={cp}
                  onChange={setCp}
                  placeholder="Ej. 99300"
                />
              </div>

              <Input
                label="Teléfono"
                value={telefono}
                onChange={setTelefono}
                placeholder="Ej. 4921234567"
                className="mb-3"
              />

              <Input
                label="Referencias"
                value={referencias}
                onChange={setReferencias}
                placeholder="Ej. Casa verde, frente a la tienda"
                className="mb-4"
              />

              <label className="block text-sm mb-1 text-slate-300">
                Método de pago
              </label>

              <select
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="pago_en_entrega">Efectivo al entregar</option>
                <option value="transferencia">Transferencia bancaria</option>
              </select>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCrearPedido}
                  disabled={creatingOrder || !hasItems}
                  className="w-full rounded-xl px-4 py-3 text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px]"
                >
                  {creatingOrder ? "Creando pedido..." : "Realizar pedido"}
                </button>

                <button
                  onClick={handleVaciar}
                  disabled={creatingOrder || !hasItems}
                  className="w-full rounded-xl px-4 py-3 text-base font-bold bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px]"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1 text-slate-300">{label}</label>

      <input
        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}