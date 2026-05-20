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
  const [isRutero, setIsRutero] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizarUsuario = (u = {}) => {
    const tipo = u.tipo || "cliente";

    return {
      ...u,
      id: u.id || u._id || "",
      _id: u._id || u.id || "",
      tipo,
      telefono: u.telefono || "",
      rutaHabitual: u.rutaHabitual || "",
      rutasAsignadas: Array.isArray(u.rutasAsignadas) ? u.rutasAsignadas : [],
      direccion: {
        calle: u.direccion?.calle || "",
        numero: u.direccion?.numero || "",
        colonia: u.direccion?.colonia || "",
        municipio: u.direccion?.municipio || "",
        estado: u.direccion?.estado || "",
        cp: u.direccion?.cp || "",
        referencias: u.direccion?.referencias || "",
      },
    };
  };

  const aplicarSesion = (usuarioNormalizado) => {
    setUser(usuarioNormalizado);
    setIsAuthenticated(true);

    setIsAdmin(
      usuarioNormalizado?.tipo === "admin" ||
        usuarioNormalizado?.tipo === "admin_empresa" ||
        usuarioNormalizado?.tipo === "super_admin"
    );

    setIsRutero(usuarioNormalizado?.tipo === "rutero");
  };

  const limpiarSesion = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_magic_link");

    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsRutero(false);
  };

  const setSessionFromResponse = (data) => {
    const token = data?.token;

    if (token) {
      localStorage.setItem("token", token);
    }

    const rawUser = data?.user || data;
    const usuarioNormalizado = normalizarUsuario(rawUser);

    aplicarSesion(usuarioNormalizado);
  };

  const signup = async (data) => {
    try {
      setErrors([]);

      const res = await registerRequest(data);
      setSessionFromResponse(res.data);

      return res.data;
    } catch (error) {
      const mensajes =
        error.response?.data?.message || ["Error al registrarse"];

      setErrors(Array.isArray(mensajes) ? mensajes : [mensajes]);
      throw error;
    }
  };

  const signin = async (data) => {
    try {
      setErrors([]);

      const res = await loginRequest(data);
      setSessionFromResponse(res.data);

      return res.data;
    } catch (error) {
      const mensajes =
        error.response?.data?.message || ["Error al iniciar sesión"];

      setErrors(Array.isArray(mensajes) ? mensajes : [mensajes]);
      throw error;
    }
  };

  const signout = async () => {
    try {
      await logoutRequest();
    } catch (_error) {
      // limpiamos sesión local aunque falle backend
    } finally {
      limpiarSesion();
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = localStorage.getItem("token");
        const magicUserRaw = localStorage.getItem("usuario_magic_link");

        if (!token) {
          limpiarSesion();
          return;
        }

        // LINK MÁGICO:
        // si ya tenemos usuario guardado del link, entramos sin pedir profile
        if (magicUserRaw) {
          const magicUser = JSON.parse(magicUserRaw);
          aplicarSesion(normalizarUsuario(magicUser));
          return;
        }

        const res = await profileRequest();
        const rawUser = res.data?.user || res.data;
        aplicarSesion(normalizarUsuario(rawUser));
      } catch (_error) {
        limpiarSesion();
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  useEffect(() => {
    if (errors.length === 0) return;

    const timer = setTimeout(() => {
      setErrors([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [errors]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isRutero,
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