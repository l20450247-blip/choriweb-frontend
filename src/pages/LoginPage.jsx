import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";

import logoChoriMalpa from "../assets/logo-chorimalpa.png";
import portadaChoriMalpa from "../assets/chorimalpa12.jpeg";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { signin, errors, isAuthenticated, user } = useAuth();
  const [captchaToken, setCaptchaToken] = useState(null);
  const navigate = useNavigate();

  const mandarSegunRol = (usuario) => {
    const tipo = usuario?.tipo;

    if (tipo === "admin" || tipo === "admin_empresa" || tipo === "super_admin") {
      navigate("/admin/pedidos", { replace: true });
      return;
    }

    if (tipo === "rutero") {
      navigate("/rutero/pedidos", { replace: true });
      return;
    }

    navigate("/productos", { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      mandarSegunRol(user);
    }
  }, [isAuthenticated, user]);

  const onSubmit = handleSubmit(async (data) => {
    if (!captchaToken) {
      alert("Por favor completa el reCAPTCHA");
      return;
    }

    const res = await signin({
      email: data.email,
      password: data.password,
      captcha: "test",
    });

    mandarSegunRol(res?.user || res);
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.75)), url(${portadaChoriMalpa})`,
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl text-white"
      >
        <div className="text-center mb-6">
          <img
            src={logoChoriMalpa}
            alt="ChoriMalpa"
            className="w-28 h-28 object-contain mx-auto mb-4 rounded-2xl shadow-xl"
          />

          <h1 className="text-3xl font-extrabold">
            Iniciar <span className="text-amber-400">sesión</span>
          </h1>

          <p className="text-slate-300 text-sm mt-2">
            Accede a ChoriWeb para continuar con tus pedidos.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/60 text-red-100 p-3 rounded-xl mb-4 text-sm">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <label className="block text-sm mb-1 text-slate-200">Email</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 text-white"
          placeholder="cliente@example.com"
        />

        <label className="block text-sm mb-1 text-slate-200">Contraseña</label>
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 text-white"
          placeholder="********"
        />

        <div className="flex justify-center mb-4 overflow-hidden">
          <div className="scale-90 md:scale-100 origin-center">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 w-full p-3 rounded-xl font-bold text-slate-950 transition-all duration-200 shadow-lg"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}