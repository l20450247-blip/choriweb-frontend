import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { signup, errors, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit((data) => {
    signup(data);
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={onSubmit}
        className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Registro de cliente
        </h1>

        {errors.length > 0 && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <label className="block text-sm text-gray-200 mb-1">Nombre</label>
        <input
          type="text"
          {...register("nombre")}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-700 text-white outline-none"
          placeholder="Tu nombre"
        />

        <label className="block text-sm text-gray-200 mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-700 text-white outline-none"
          placeholder="ejemplo@example.com"
        />

        <label className="block text-sm text-gray-200 mb-1">Contraseña</label>
        <input
          type="password"
          {...register("password")}
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white outline-none"
          placeholder="PasswordFuerte123!"
        />

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
