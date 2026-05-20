import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";

export default function PedidoRapidoPage() {
  const { token } = useParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const validarLink = async () => {
      try {
        setError("");

        const res = await api.get(`/magic-links/validar/${token}`);
        const data = res.data;

        if (!data?.token || !data?.user) {
          throw new Error("Respuesta inválida del servidor");
        }

        // Ahora sí limpiamos sesión anterior, pero solo cuando el link ya fue válido
        localStorage.removeItem("token");
        localStorage.removeItem("usuario_magic_link");

        // Guardamos el nuevo token del cliente del link mágico
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario_magic_link", JSON.stringify(data.user));

        // Dejamos axios listo con el token nuevo
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

        // Mandamos al cliente a productos
        window.location.href = "/productos";
      } catch (error) {
        console.error("ERROR LINK MÁGICO:", error);

        setError(
          error.response?.data?.message?.[0] ||
            error.response?.data?.message ||
            "El enlace es inválido, expiró o no se pudo iniciar sesión"
        );
      }
    };

    if (token) {
      validarLink();
    }
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
        <div className="bg-slate-800 p-8 rounded-xl text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            No se pudo entrar
          </h1>

          <p className="text-slate-300 mb-6">{error}</p>

          <a
            href="/login"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2 rounded inline-block"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="bg-slate-800 p-8 rounded-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Entrando a ChoriWeb...</h1>

        <p className="text-slate-300">Validando acceso rápido.</p>
      </div>
    </div>
  );
}