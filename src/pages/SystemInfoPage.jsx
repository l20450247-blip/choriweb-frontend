import logoChoriMalpa from "../assets/logo-chorimalpa.png";

export default function SystemInfoPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src={logoChoriMalpa}
            alt="Logo CHORIMALPA"
            className="w-32 h-32 rounded-2xl object-cover mb-5 shadow-lg"
          />

          <h1 className="text-4xl md:text-5xl font-extrabold">
            Chori<span className="text-yellow-400">Web</span>
          </h1>

          <p className="mt-3 text-slate-300 text-lg">
            Sistema de gestión de ventas, pedidos, inventario y rutas.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <Info title="Versión" value="1.0.0" />
          <Info title="Empresa" value="CHORIMALPA" />
          <Info title="Desarrollador" value="Aaron Albino Ojeda" />
          <Info title="Institución" value="Instituto Tecnológico de Zacatecas" />
          <Info title="Correo" value="aaron1albino2@gmail.com" />
          <Info title="Fecha" value="Junio 2026" />
        </div>

        <div className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">
            Información del sistema
          </h2>
          <p className="text-slate-300 leading-relaxed">
            ChoriWeb es una plataforma web desarrollada para la empresa
            CHORIMALPA, orientada a la administración de pedidos, productos,
            inventario, rutas de entrega y distribución.
          </p>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm">
          © 2026 ChoriWeb. Todos los derechos reservados.
        </p>
      </section>
    </main>
  );
}

function Info({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-white font-bold text-lg mt-1">{value}</p>
    </div>
  );
}