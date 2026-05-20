import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, signout } = useAuth();

  const isRutero = user?.tipo === "rutero";

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
    <nav className="bg-slate-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="text-xl md:text-2xl font-extrabold tracking-wide text-white"
          >
            ChoriWeb
          </Link>

          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1 md:pb-0">
            {isAuthenticated && !isRutero && (
              <NavLink to="/productos" className={getLinkClass}>
                Ver tienda
              </NavLink>
            )}

            {isAuthenticated && !isAdmin && !isRutero && (
              <>
                <NavLink to="/carrito" className={getLinkClass}>
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
                  className="bg-red-500 hover:bg-red-600 text-xs md:text-sm font-semibold px-4 py-2 rounded-lg"
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