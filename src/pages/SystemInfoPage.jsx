// src/pages/SystemInfoPage.jsx

export default function SystemInfoPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Información del Sistema
      </h1>

      <section className="bg-slate-800 rounded-2xl shadow-lg p-6 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">ChoriWeb</h2>

        <div className="space-y-3 text-slate-200">
          <p><strong>Nombre del sistema:</strong> ChoriWeb</p>
          <p><strong>Versión:</strong> 1.0</p>
          <p><strong>Empresa:</strong> Chorizos Malpaso</p>
          <p><strong>Frontend:</strong> React + Vite</p>
          <p><strong>Backend:</strong> Node.js + Express</p>
          <p><strong>Base de datos:</strong> MongoDB Atlas</p>
          <p><strong>Estado:</strong> Sistema activo y en funcionamiento</p>
        </div>
      </section>
    </main>
  );
}