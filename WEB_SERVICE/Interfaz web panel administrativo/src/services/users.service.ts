import api from "./api";
import type {
  UserListResponse,
  UserWithRelations,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types";

export const usersService = {
  /**
   * Listar usuarios con paginación y filtros
   */
  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    branchId?: number;
    departmentId?: number;
    positionId?: number;
  }): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>("/users", { params });
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   */
  async findById(id: number): Promise<UserWithRelations> {
    const response = await api.get<UserWithRelations>(`/users/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo usuario
   */
  async create(data: CreateUserRequest): Promise<UserWithRelations> {
    const response = await api.post<UserWithRelations>("/users", data);
    return response.data;
  },

  /**
   * Actualizar un usuario
   */
  async update(
    id: number,
    data: UpdateUserRequest,
  ): Promise<UserWithRelations> {
    const response = await api.put<UserWithRelations>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar (soft delete) un usuario
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /**
   * Activar/Desactivar un usuario
   */
  async toggleStatus(id: number): Promise<{ active: boolean }> {
    const response = await api.patch<{ active: boolean }>(
      `/users/${id}/toggle-status`,
    );
    return response.data;
  },

  /**
   * Cambiar contraseña de un usuario
   */
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.patch(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Obtener estadísticas de usuarios
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byStatus: { status: string; count: number }[];
    byRole: { role: string; count: number }[];
  }> {
    const response = await api.get("/users/stats");
    return response.data;
  },
};
