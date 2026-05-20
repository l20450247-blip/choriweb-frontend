// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import PedidoRapidoPage from "./pages/PedidoRapidoPage";

import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminRoutesPage from "./pages/AdminRoutesPage";

import RuteroOrdersPage from "./pages/RuteroOrdersPage";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Link mágico para cliente */}
        <Route path="/pedido-rapido/:token" element={<PedidoRapidoPage />} />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rutero/pedidos"
          element={
            <ProtectedRoute>
              <RuteroOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute requireAdmin>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute requireAdmin>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventario"
          element={
            <ProtectedRoute requireAdmin>
              <AdminInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rutas"
          element={
            <ProtectedRoute requireAdmin>
              <AdminRoutesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;