import { useAuth } from "../context/AuthContext";

import logoChoriMalpa from "../assets/logo-chorimalpa.png";
import portadaChoriMalpa from "../assets/chorimalpa12.jpeg";
import promoChoriMalpa from "../assets/ChoriMalpa1.jpeg";

export default function HomePage() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* HERO */}
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.68)), url(${portadaChoriMalpa})`,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <img
            src={logoChoriMalpa}
            alt="ChoriMalpa"
            className="w-40 md:w-56 mx-auto mb-6 drop-shadow-2xl rounded-2xl"
          />

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Bienvenido a{" "}
            <span className="text-amber-400">ChoriMalpa</span>
          </h1>

          {!isAuthenticated && (
            <>
              <p className="text-lg md:text-2xl text-slate-100 max-w-3xl mx-auto mb-8 font-medium">
                Productos 100% zacatecanos elaborados artesanalmente en
                Malpaso, Zacatecas.
              </p>

              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-600 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl">
                <p className="text-base md:text-lg text-slate-200 leading-relaxed">
                  Inicia sesión o regístrate para comenzar a hacer tus pedidos
                  de chorizo artesanal.
                </p>
              </div>

              {/* FACEBOOK */}
              <div className="mt-8">
                <a
                  href="https://www.facebook.com/share/1KJHBhWTwA/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm md:text-base"
                >
                  📘 Visita nuestro Facebook oficial
                </a>
              </div>
            </>
          )}

          {isAuthenticated && (
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 px-8 py-6 rounded-2xl shadow-2xl mt-6 max-w-2xl mx-auto">
              <p className="text-2xl md:text-3xl font-bold">
                Hola,{" "}
                <span className="text-amber-400">
                  {user?.nombre}
                </span>
              </p>

              <p className="text-slate-200 mt-3 text-lg">
                Rol:{" "}
                <span className="font-semibold text-white">
                  {isAdmin ? "Administrador" : "Cliente"}
                </span>
              </p>

              <p className="text-slate-300 mt-4">
                Ya puedes navegar por el sistema y realizar tus pedidos.
              </p>

              <div className="mt-6">
                <a
                  href="https://www.facebook.com/share/1KJHBhWTwA/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold"
                >
                  📘 Facebook oficial de ChoriMalpa
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN PROMOCIONAL */}
      <div className="bg-slate-950 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <img
              src={promoChoriMalpa}
              alt="Productos ChoriMalpa"
              className="rounded-3xl shadow-2xl border border-slate-700 w-full hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Sabor tradicional de{" "}
              <span className="text-amber-400">
                Malpaso, Zacatecas
              </span>
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              En ChoriMalpa elaboramos productos artesanales con ingredientes
              de calidad y recetas tradicionales zacatecanas.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-400 transition-colors duration-200">
                🌭 Chorizo artesanal de alta calidad
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-400 transition-colors duration-200">
                🥩 Productos frescos y 100% mexicanos
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-400 transition-colors duration-200">
                🚚 Sistema moderno de pedidos y rutas
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-400 transition-colors duration-200">
                📱 Compatible con teléfonos Android y iPhone
              </div>
            </div>

            <div className="mt-8">
              <a
                href="https://www.facebook.com/share/1KJHBhWTwA/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold"
              >
                📘 Síguenos en Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}