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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    employeeId: number;
    fullName: string;
    email?: string | null;
    role?: "admin" | "manager" | "employee";
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log("🌐 [API] Enviando login...");

    const response = await api.post("/auth/login", credentials);

    console.log("🌐 [API] Response completa:", response.data);

    // 👈 La respuesta está envuelta en un interceptor
    // La estructura real es: { data: { accessToken, refreshToken, expiresIn, user }, statusCode, message, timestamp, path }
    const wrappedData = response.data;
    const actualData = wrappedData.data || wrappedData; // Fallback por si no está envuelto

    console.log("🌐 [API] Datos reales:", actualData);

    // Normalizar la respuesta (camelCase → snake_case)
    const normalizedResponse: LoginResponse = {
      access_token: actualData.accessToken || actualData.access_token || "",
      refresh_token: actualData.refreshToken || actualData.refresh_token,
      expires_in: actualData.expiresIn || actualData.expires_in || 604800,
      user: {
        id: actualData.user?.id || 0,
        username: actualData.user?.username || "",
        employeeId:
          actualData.user?.employeeId || actualData.user?.employee_id || 0,
        fullName: actualData.user?.fullName || actualData.user?.full_name || "",
        email: actualData.user?.email || null,
        role: actualData.user?.role || "employee",
      },
    };

    console.log("🌐 [API] Response normalizada:", normalizedResponse);

    return normalizedResponse;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};
