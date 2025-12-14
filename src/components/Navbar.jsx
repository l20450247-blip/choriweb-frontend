import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, signout } = useAuth();

  const linkBase =
    "px-4 py-2 text-sm font-medium transition-colors duration-150";
  const getLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive ? "text-amber-400" : "text-slate-100 hover:text-amber-300"
    }`;

  const handleLogoutClick = async () => {
    console.log(" Click en botón Salir");
    await signout();
  };

  return (
    <nav className="bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          Choriweb
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2">
          <NavLink to="/productos" className={getLinkClass}>
            Productos
          </NavLink>

          {/* Cliente */}
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/carrito" className={getLinkClass}>
                Mi carrito
              </NavLink>
              <NavLink to="/mis-pedidos" className={getLinkClass}>
                Mis pedidos
              </NavLink>
            </>
          )}

          {/* Admin */}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink to="/admin/productos" className={getLinkClass}>
                Admin productos
              </NavLink>
              <NavLink to="/admin/categorias" className={getLinkClass}>
                Admin categorías
              </NavLink>
              <NavLink to="/admin/pedidos" className={getLinkClass}>
                Admin pedidos
              </NavLink>
            </>
          )}
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-300">
                {isAdmin ? (
                  <>
                    Administrador{" "}
                    <span className="text-emerald-400">(Admin)</span>
                  </>
                ) : (
                  <>
                    {user?.nombre || "Cliente"}{" "}
                    <span className="text-emerald-400">(Cliente)</span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="bg-red-500 hover:bg-red-600 text-sm font-semibold px-4 py-1.5 rounded"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={getLinkClass}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

