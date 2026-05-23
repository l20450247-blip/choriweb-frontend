import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, signout } = useAuth();
  const { cart } = useCart();

  const isRutero = user?.tipo === "rutero";

  // Productos del carrito
  const cartItems = cart?.items || [];

  // Contador total
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce(
        (total, item) =>
          total + Number(item.cantidad || item.quantity || 1),
        0
      )
    : 0;

  const linkBase =
    "px-3 py-2 text-xs md:text-sm font-medium transition-colors duration-150 whitespace-nowrap";

  const getLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive ? "text-amber-400" : "text-slate-100 hover:text-amber-300"
    }`;

  const handleLogoutClick = async () => {
    await signout();
  };

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-extrabold tracking-wide text-white"
          >
            ChoriWeb
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1 md:pb-0">

            {isAuthenticated && !isRutero && (
              <NavLink to="/productos" className={getLinkClass}>
                Ver tienda
              </NavLink>
            )}

            {isAuthenticated && !isAdmin && !isRutero && (
              <>
                {/* Carrito */}
                <NavLink
                  to="/carrito"
                  className={({ isActive }) =>
                    `${getLinkClass({
                      isActive,
                    })} relative inline-flex items-center gap-2`
                  }
                >
                  <span className="relative inline-flex">
                    <FaShoppingCart className="text-base" />

                    {/* Puntito rojo */}
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-slate-950">
                        {cartCount}
                      </span>
                    )}
                  </span>

                  Mi carrito
                </NavLink>

                <NavLink to="/mis-pedidos" className={getLinkClass}>
                  Mis pedidos
                </NavLink>
              </>
            )}

            {isAuthenticated && isRutero && (
              <NavLink to="/rutero/pedidos" className={getLinkClass}>
                Mis entregas
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/productos" className={getLinkClass}>
                  Productos
                </NavLink>

                <NavLink to="/admin/categorias" className={getLinkClass}>
                  Categorías
                </NavLink>

                <NavLink to="/admin/pedidos" className={getLinkClass}>
                  Pedidos
                </NavLink>

                <NavLink to="/admin/inventario" className={getLinkClass}>
                  Inventario
                </NavLink>

                <NavLink to="/admin/rutas" className={getLinkClass}>
                  Rutas
                </NavLink>
              </>
            )}
          </div>

          {/* Usuario */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-xs md:text-sm text-slate-300 truncate">
                  {user?.nombre || "Usuario"}{" "}
                  <span className="text-emerald-400">
                    ({isAdmin ? "Admin" : isRutero ? "Rutero" : "Cliente"})
                  </span>
                </span>

                <button
                  onClick={handleLogoutClick}
                  className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-xs md:text-sm font-semibold px-4 py-2 rounded-xl shadow-md"
                >
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <NavLink to="/login" className={getLinkClass}>
                  Iniciar sesión
                </NavLink>

                <NavLink to="/register" className={getLinkClass}>
                  Registrarse
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}