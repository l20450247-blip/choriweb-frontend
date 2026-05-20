import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

import logoChoriMalpa from "../assets/logo-chorimalpa.png";
import portadaChoriMalpa from "../assets/chorimalpa12.jpeg";

export default function RegisterPage() {
  const [rutas, setRutas] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(true);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      nombre: "",
      telefono: "",
      email: "",
      password: "",
      rutaHabitual: "",
      direccion: {
        calle: "",
        numero: "",
        colonia: "",
        municipio: "",
        estado: "Zacatecas",
        cp: "",
        referencias: "",
      },
    },
  });

  const { signup, errors, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const cargarRutas = async () => {
    try {
      setLoadingRutas(true);

      const res = await api.get("/config-rutas");

      const rutasActivas = (res.data || []).filter((ruta) => ruta.activa);

      setRutas(rutasActivas);
    } catch (error) {
      console.error("Error al cargar rutas:", error);
      setRutas([]);
    } finally {
      setLoadingRutas(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  const onSubmit = handleSubmit((data) => {
    const payload = {
      ...data,
      rutasAsignadas: data.rutaHabitual ? [data.rutaHabitual] : [],
    };

    signup(payload);
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/productos");
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.78)), url(${portadaChoriMalpa})`,
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl bg-slate-900/85 backdrop-blur-md border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl text-white"
      >
        <div className="text-center mb-6">
          <img
            src={logoChoriMalpa}
            alt="ChoriMalpa"
            className="w-24 h-24 md:w-28 md:h-28 object-contain mx-auto mb-4 rounded-2xl shadow-xl"
          />

          <h1 className="text-3xl md:text-4xl font-extrabold">
            Registro de <span className="text-amber-400">cliente</span>
          </h1>

          <p className="text-slate-300 text-sm mt-2">
            Crea tu cuenta para realizar pedidos en ChoriMalpa.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/60 text-red-100 p-3 mb-5 rounded-xl text-sm">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="nombre"
            register={register}
            placeholder="Tu nombre"
          />

          <Input
            label="Teléfono"
            name="telefono"
            register={register}
            placeholder="4921234567"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            placeholder="ejemplo@example.com"
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            register={register}
            placeholder="PasswordFuerte123!"
          />

          <div>
            <label className="block text-sm text-slate-200 mb-1">
              Ruta habitual
            </label>

            <select
              {...register("rutaHabitual")}
              className="w-full px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">
                {loadingRutas ? "Cargando rutas..." : "Selecciona una ruta"}
              </option>

              {rutas.map((ruta) => (
                <option key={ruta._id} value={ruta.ruta}>
                  {ruta.ruta} - {ruta.diaSemana}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-400 mt-2">
              Esta ruta se carga desde las rutas configuradas por el
              administrador.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          Dirección de entrega
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Calle"
            name="direccion.calle"
            register={register}
            placeholder="Calle"
          />

          <Input
            label="Número"
            name="direccion.numero"
            register={register}
            placeholder="Número"
          />

          <Input
            label="Colonia"
            name="direccion.colonia"
            register={register}
            placeholder="Colonia"
          />

          <Input
            label="Municipio"
            name="direccion.municipio"
            register={register}
            placeholder="Municipio"
          />

          <Input
            label="Estado"
            name="direccion.estado"
            register={register}
            placeholder="Estado"
          />

          <Input
            label="CP"
            name="direccion.cp"
            register={register}
            placeholder="Código Postal"
          />

          <div className="md:col-span-2">
            <Input
              label="Referencias"
              name="direccion.referencias"
              register={register}
              placeholder="Casa color rojo, frente a la tienda..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-7 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all duration-200"
        >
          Crear cuenta
        </button>
      </form>
    </div>
  );
}

function Input({ label, name, register, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-slate-200 mb-1">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="w-full px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
        placeholder={placeholder}
      />
    </div>
  );
}