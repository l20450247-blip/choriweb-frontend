// src/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}) {
  const { user, loading } = useAuth();

  // Mientras carga el usuario (por si hay token guardado)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  // Si NO hay usuario, lo mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere admin y el usuario NO es admin, lo mandamos al inicio
  if (requireAdmin && user.tipo !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, mostramos el contenido protegido
  return children;
}
