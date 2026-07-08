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
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log("🌐 [AuthService] Login:", credentials.username);

    const response = await api.post("/auth/login", credentials);
    const actualData = response.data.data || response.data;

    console.log("🌐 [AuthService] User recibido:", actualData.user);

    return {
      user: actualData.user,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("⚠️ [AuthService] Error en logout:", error);
    }
  },

  getProfile: async (): Promise<User> => {
    console.log("🌐 [AuthService] Obteniendo perfil...");
    const response = await api.get("/auth/me");
    const actualData = response.data.data || response.data;
    return actualData;
  },

  refreshToken: async (): Promise<{
    accessToken: string;
    expiresIn: number;
  }> => {
    const response = await api.post("/auth/refresh");
    const actualData = response.data.data || response.data;
    return {
      accessToken: actualData.accessToken || actualData.access_token || "",
      expiresIn: actualData.expiresIn || actualData.expires_in || 604800,
    };
  },
};
