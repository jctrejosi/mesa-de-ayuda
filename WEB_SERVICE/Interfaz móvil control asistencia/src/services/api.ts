import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    console.log("🌐 [API Interceptor] URL:", config.url);
    console.log(
      "🌐 [API Interceptor] Token:",
      token ? "✅ PRESENTE" : "❌ NO ENCONTRADO",
    );
    console.log(
      "🌐 [API Interceptor] Token value:",
      token?.substring(0, 20) + "...",
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🌐 [API Interceptor] Authorization header agregado");
    } else {
      console.warn("⚠️ [API Interceptor] No hay token!");
    }

    console.log("🌐 [API Interceptor] Headers finales:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ [API Interceptor] Error en request:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
