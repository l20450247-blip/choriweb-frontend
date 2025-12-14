import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Choriweb </h1>

      {!isAuthenticated && (
        <p className="text-lg text-slate-300">
          Inicia sesión o registrate para comenzar a hacer tus pedidos.
        </p>
      )}

      {isAuthenticated && (
        <div className="bg-slate-800 px-6 py-4 rounded-lg shadow mt-4 text-center">
          <p className="text-xl font-semibold">
            Hola, <span className="text-amber-400">{user?.nombre}</span> 
          </p>
          <p className="text-sm text-slate-300 mt-1">
            Rol:{" "}
            <span className="font-semibold">
              {isAdmin ? "Administrador" : "Cliente"}
            </span>
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Ya puedes navegar por el sistema y hacer tus pedidos.
          </p>
        </div>
      )}
    </div>
  );
}
