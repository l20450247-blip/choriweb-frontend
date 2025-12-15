// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  profileRequest,
} from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const setSessionFromResponse = (data) => {
    // ✅ si backend manda token, lo guardamos
    const token = data?.token;
    if (token) localStorage.setItem("token", token);

    // ✅ el backend puede mandar { user: {...}, token } o directo el user
    const u = data?.user || data;
    setUser(u);
    setIsAuthenticated(true);
    setIsAdmin(u?.tipo === "admin");
  };

  // ✅ Registrar usuario
  const signup = async (data) => {
    try {
      setErrors([]);
      const res = await registerRequest(data);
      setSessionFromResponse(res.data);
    } catch (error) {
      console.error("Error en signup:", error);
      if (error.response?.data?.message) setErrors(error.response.data.message);
      else setErrors(["Error al registrarse"]);
    }
  };

  // ✅ Login
  const signin = async (data) => {
    try {
      setErrors([]);
      const res = await loginRequest(data);
      setSessionFromResponse(res.data);
    } catch (error) {
      console.error("Error en signin:", error);
      if (error.response?.data?.message) setErrors(error.response.data.message);
      else setErrors(["Error al iniciar sesión"]);
    }
  };

  // ✅ Logout
  const signout = async () => {
    console.log("👉 Ejecutando signout() desde AuthContext");
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Error en logoutRequest (ignorado en front):", error);
    } finally {
      // ✅ limpiar todo
      Cookies.remove("token");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      console.log("✅ Sesión limpiada en el front");
    }
  };

  // ✅ Verificar sesión al recargar
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // ✅ ahora la fuente principal es localStorage
        const token = localStorage.getItem("token");

        // (si no hay token en localStorage, no intentamos profile)
        if (!token) {
          setLoading(false);
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
          return;
        }

        const res = await profileRequest();
        const u = res.data?.user || res.data;

        setUser(u);
        setIsAuthenticated(true);
        setIsAdmin(u?.tipo === "admin");
      } catch (error) {
        console.error("Error al verificar sesión:", error);
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // ✅ Limpiar errores
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        errors,
        loading,
        signup,
        signin,
        signout,
        logout: signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
