import api from "./api";
import type { LoginRequest, LoginResponse, UserProfile } from "../types";

export const authService = {
  /**
   * Iniciar sesión con username y password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    // Guardar token y usuario en localStorage
    if (response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Cerrar sesión (elimina token y redirige)
   */
  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>("/auth/me");
    return response.data;
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): LoginResponse["user"] | null {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  },

  /**
   * Obtener el rol del usuario
   */
  getRole(): "admin" | "manager" | "employee" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  /**
   * Verificar si es administrador o manager
   */
  isAdminOrManager(): boolean {
    const role = this.getRole();
    return role === "admin" || role === "manager";
  },
};
