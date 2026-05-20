// src/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;
  const tipo = user?.tipo;

  const adminRoles = ["admin", "admin_empresa", "super_admin"];
  const esAdmin = adminRoles.includes(tipo);
  const esRutero = tipo === "rutero";
  const esCliente = tipo === "cliente";

  // Rutas que también puede ver el admin como vista pública
  const rutasPermitidasParaAdmin = ["/productos"];

  if (requireAdmin && !esAdmin) {
    return <Navigate to="/login" replace />;
  }

  // El admin normalmente debe estar en /admin,
  // pero también le permitimos entrar a /productos para ver la tienda.
  if (
    esAdmin &&
    !path.startsWith("/admin") &&
    !rutasPermitidasParaAdmin.includes(path)
  ) {
    return <Navigate to="/admin/pedidos" replace />;
  }

  if (esRutero && !path.startsWith("/rutero")) {
    return <Navigate to="/rutero/pedidos" replace />;
  }

  if (esCliente && path.startsWith("/admin")) {
    return <Navigate to="/productos" replace />;
  }

  if (esCliente && path.startsWith("/rutero")) {
    return <Navigate to="/productos" replace />;
  }

  return children;
}