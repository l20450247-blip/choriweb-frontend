import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { signin, errors, isAuthenticated } = useAuth();
  const [captchaToken, setCaptchaToken] = useState(null);
  const navigate = useNavigate();

  //  Cuando ya este autenticado, redirige a /productos
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/productos"); // puedes cambiar la ruta si quieres
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit((data) => {
    if (!captchaToken) {
      alert("Por favor completa el reCAPTCHA");
      return;
    }

    // Mandamos email, password y el token del reCAPTCHA al backend
    signin({
      ...data,
      captcha: captchaToken,
    });
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={onSubmit}
        className="bg-slate-800 p-8 rounded-lg shadow w-full max-w-md text-white"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesion</h1>

        {errors.length > 0 && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full mb-4 p-2 rounded bg-slate-700"
          placeholder="admin@example.com"
        />

        <label className="block text-sm mb-1">Contrasena</label>
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full mb-4 p-2 rounded bg-slate-700"
          placeholder="********"
        />

        {/*  Aquí va el reCAPTCHA de Google */}
        <div className="flex justify-center mb-4">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 w-full p-2 rounded font-semibold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
