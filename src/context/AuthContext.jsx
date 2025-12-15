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

  // ✅ Registrar usuario
  const signup = async (data) => {
    try {
      setErrors([]);
      const res = await registerRequest(data);

      setUser(res.data);
      setIsAuthenticated(true);

      // ✅ Detectar admin SIN variables de entorno
      setIsAdmin(res.data?.tipo === "admin");
    } catch (error) {
      console.error("Error en signup:", error);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors(["Error al registrarse"]);
      }
    }
  };

  // ✅ Login
  const signin = async (data) => {
    try {
      setErrors([]);
      const res = await loginRequest(data);

      setUser(res.data);
      setIsAuthenticated(true);

      // ✅ Detectar admin SIN variables de entorno
      setIsAdmin(res.data?.tipo === "admin");
    } catch (error) {
      console.error("Error en signin:", error);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors(["Error al iniciar sesión"]);
      }
    }
  };

  // ✅ Logout (signout)
  const signout = async () => {
    console.log("👉 Ejecutando signout() desde AuthContext");
    try {
      await logoutRequest(); // avisa al backend que cierre sesión
    } catch (error) {
      console.error("Error en logoutRequest (ignorado en front):", error);
    } finally {
      // limpiamos SIEMPRE el estado local
      Cookies.remove("token");
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
        const token = Cookies.get("token");
        if (!token) {
          setLoading(false);
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
          return;
        }

        const res = await profileRequest();

        setUser(res.data);
        setIsAuthenticated(true);

        // ✅ Detectar admin SIN variables de entorno
        setIsAdmin(res.data?.tipo === "admin");
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
        signout, // nombre oficial
        logout: signout, // alias, por si acaso
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
