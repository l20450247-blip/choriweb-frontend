// src/pages/CartPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { createOrderRequest } from "../api/orders.js";

export default function CartPage() {
  const { cart, loading, errorMsg, okMsg, clearCart, loadCart } = useCart();
  const navigate = useNavigate();

  // Campos de dirección separados
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("Zacatecas");
  const [cp, setCp] = useState("");
  const [telefono, setTelefono] = useState("");

  // Método de pago que entiende el backend
  const [metodoPago, setMetodoPago] = useState("pago_en_entrega");
  const [creatingOrder, setCreatingOrder] = useState(false);

  const hasItems = cart?.items && cart.items.length > 0;

  const handleCrearPedido = async () => {
    if (!hasItems) {
      alert("Tu carrito está vacío");
      return;
    }

    // Validaciones rápidas de dirección
    if (!calle.trim() || !numero.trim() || !colonia.trim() || !municipio.trim()) {
      alert("Completa al menos calle, número, colonia y municipio.");
      return;
    }

    try {
      setCreatingOrder(true);

      console.log(" Items del carrito antes de armar pedido:", cart.items);

      // Armamos los items como los pide el modelo:
      // producto (ObjectId), cantidad, precioUnitario, subtotal
      const items = cart.items.map((item) => {
        //  AQUÍ EL CAMBIO IMPORTANTE:
        // usa el id que exista: item.producto || item.productoId || item._id
        const productoIdForOrder =
          item.producto || item.productoId || item._id;

        const precioUnitario = Number(item.precio) || 0;
        const cantidad = Number(item.cantidad) || 0;
        const subtotal = precioUnitario * cantidad;

        return {
          producto: productoIdForOrder,  //  ahora sí mandamos algo
          cantidad,
          precioUnitario,
          subtotal,
          nombreProducto: item.nombre,   // opcional/informativo
        };
      });

      const total =
        cart.total ||
        items.reduce((sum, it) => sum + (it.subtotal || 0), 0);

      const direccion = {
        calle: calle.trim(),
        numero: numero.trim(),
        colonia: colonia.trim(),
        municipio: municipio.trim(),
        estado: estado.trim() || "Zacatecas",
        cp: cp.trim() || "00000",
        telefono: telefono.trim() || "0000000000",
      };

      const direccionTexto = `${calle} #${numero}, ${colonia}, ${municipio}, ${estado}, CP ${cp}`;

      const payload = {
        items,
        total,
        direccion,
        direccionTexto,
        metodo_pago: metodoPago, // "pago_en_entrega"
      };

      console.log(" Payload que se envía a /api/pedidos:", payload);

      const res = await createOrderRequest(payload);

      console.log(" Pedido creado:", res.data);
      alert("Pedido creado correctamente ");

      await clearCart();
      await loadCart();

      navigate("/mis-pedidos");
    } catch (error) {
      console.error(" Error al crear pedido:", error);
      const msg =
        error.response?.data?.message?.[0] ||
        "Error al crear el pedido";
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

  const formatMXN = (n) =>
    Number(n || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mi carrito</h1>

        {/* Mensajes */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/60 px-4 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}
        {okMsg && (
          <div className="mb-4 rounded-lg bg-emerald-500/15 border border-emerald-500/60 px-4 py-2 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        {loading && (
          <p className="text-slate-300 mb-4">
            Cargando carrito...
          </p>
        )}

        {!hasItems && !loading ? (
          <div className="mt-10 text-center text-slate-300">
            Tu carrito está vacío.
          </div>
        ) : null}

        {hasItems && (
          <>
            {/* TABLA DEL CARRITO */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/90">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Cantidad
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
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {formatMXN(item.precio)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {formatMXN(
                          (item.precio || 0) * (item.cantidad || 0)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTAL + FORMULARIO DE PEDIDO */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="text-xl font-bold">
                  Total:{" "}
                  <span className="text-amber-400">
                    {formatMXN(
                      cart.total ||
                        cart.items.reduce(
                          (sum, it) =>
                            sum +
                            (it.precio || 0) * (it.cantidad || 0),
                          0
                        )
                    )}
                  </span>
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-4 w-full md:w-[420px]">
                <h2 className="font-semibold mb-3 text-lg">
                  Datos del pedido
                </h2>

                {/* Dirección */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Calle
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                      placeholder="Ej. Calle del Arco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Número
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Ej. 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Colonia
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      placeholder="Ej. Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Municipio
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Ej. Villanueva"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Estado
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      placeholder="Ej. Zacatecas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">
                      Código postal
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                      value={cp}
                      onChange={(e) => setCp(e.target.value)}
                      placeholder="Ej. 99300"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1 text-slate-300">
                    Teléfono
                  </label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 4921234567"
                  />
                </div>

                {/* Método de pago */}
                <label className="block text-sm mb-1 text-slate-300">
                  Método de pago
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="pago_en_entrega">
                    Efectivo al entregar
                  </option>
                  <option value="transferencia_bancaria">
                    Transferencia bancaria
                  </option>
                </select>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCrearPedido}
                    disabled={creatingOrder || !hasItems}
                    className={`w-full inline-flex justify-center items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      creatingOrder || !hasItems
                        ? "bg-amber-500/40 text-amber-100 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-900"
                    }`}
                  >
                    {creatingOrder
                      ? "Creando pedido..."
                      : "Realizar pedido"}
                  </button>

                  <button
                    onClick={handleVaciar}
                    disabled={creatingOrder || !hasItems}
                    className="w-full inline-flex justify-center items-center rounded-lg px-4 py-2.5 text-sm font-semibold bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
