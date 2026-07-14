import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// URL del backend (desde .env o default)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: import.meta.env.VITE_ENABLE_CREDENTIALS,
});

// Interceptor: Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Si el token expiró, limpiar y redirigir a login
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Si no estamos en login, redirigir
      window.location.href = import.meta.env.VITE_REDIRECT_LOGINs; // Cambia esto según tu ruta de login
    }
    return Promise.reject(error);
  },
);

export default api;
