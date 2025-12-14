// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Páginas cliente
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// Páginas admin
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";

// Rutas protegidas
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <Routes>
        {/*  Páginas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/*  Productos para CLIENTES (logueados) */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        {/* Cliente: carrito */}
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        {/*  Cliente: mis pedidos */}
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        {/*  Admin */}
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute adminOnly>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute adminOnly>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
