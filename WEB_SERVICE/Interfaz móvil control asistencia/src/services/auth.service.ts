import { api } from "./api";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  employeeId: number;
  fullName: string;
  email?: string | null;
  role?: "admin" | "manager" | "employee";
  employeeCode?: string | null;
  area?: string | null;
  branch?: {
    id: number;
    name: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;
  department?: {
    id: number;
    name: string;
  } | null;
  position?: {
    id: number;
    name: string;
  } | null;
  photo?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ProfileResponse {
  id: number;
  username: string;
  employeeId: number;
  fullName: string;
  email?: string | null;
  role: "admin" | "manager" | "employee";
  employeeCode: string;
  area: string;
  branch: {
    id: number;
    name: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;
  department: {
    id: number;
    name: string;
  } | null;
  position: {
    id: number;
    name: string;
  } | null;
  photo: string | null;
  active: boolean;
}

export const authService = {
  /**
   * Iniciar sesión
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log("🌐 [AuthService] Enviando login...", credentials.username);

    const response = await api.post("/auth/login", credentials);

    console.log("🌐 [AuthService] Response status:", response.status);
    console.log("🌐 [AuthService] Response data:", response.data);

    // La respuesta está envuelta en TransformInterceptor
    const wrappedData = response.data;
    const actualData = wrappedData.data || wrappedData;

    console.log("🌐 [AuthService] Datos reales:", actualData);

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
        employeeCode:
          actualData.user?.employeeCode ||
          actualData.user?.employee_code ||
          null,
        area: actualData.user?.area || null,
        branch: actualData.user?.branch || null,
        department: actualData.user?.department || null,
        position: actualData.user?.position || null,
        photo: actualData.user?.photo || null,
      },
    };

    console.log("🌐 [AuthService] Response normalizada:", normalizedResponse);
    return normalizedResponse;
  },

  /**
   * Cerrar sesión
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("⚠️ [AuthService] Error en logout:", error);
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   * GET /auth/me
   */
  getProfile: async (): Promise<ProfileResponse> => {
    console.log("🌐 [AuthService] Obteniendo perfil...");

    const response = await api.get("/auth/me");
    const wrappedData = response.data;
    const actualData = wrappedData.data || wrappedData;

    console.log("🌐 [AuthService] Perfil obtenido:", actualData);
    return actualData;
  },

  /**
   * Refrescar token de acceso
   * POST /auth/refresh
   */
  refreshToken: async (): Promise<{
    accessToken: string;
    expiresIn: number;
  }> => {
    console.log("🌐 [AuthService] Refrescando token...");

    const response = await api.post("/auth/refresh");
    const wrappedData = response.data;
    const actualData = wrappedData.data || wrappedData;

    return {
      accessToken: actualData.accessToken || actualData.access_token || "",
      expiresIn: actualData.expiresIn || actualData.expires_in || 604800,
    };
  },
};
