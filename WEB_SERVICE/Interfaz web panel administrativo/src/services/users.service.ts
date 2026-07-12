import api from "./api";
import type {
  UserListResponse,
  UserWithRelations,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserRecord,
} from "../types";

export const usersService = {
  /**
   * Listar usuarios con paginación y filtros
   */
  async list(filters: UserFilters = {}): Promise<UserListResponse> {
    const defaultFilters = { page: 1, limit: 20 };
    const payload = { ...defaultFilters, ...filters };

    const response = await api.post("/users/list", payload);
    // Asumiendo que el interceptor ya devuelve los datos directamente
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
  async create(
    data: Partial<UserRecord> & { password: string },
  ): Promise<UserRecord> {
    const payload = {
      firstName: data.fullName?.split(" ")[0] || "",
      lastName: data.fullName?.split(" ").slice(1).join(" ") || "",
      username: data.username || "",
      password: data.password || "",
      email: data.email || "",
      employeeCode: data.employeeCode || "",
      role: data.role || "employee",
      status: data.status || "ACTIVE",
      branchId: data.branchId || null,
      departmentId: data.departmentId || null,
      positionId: data.positionId || null,
      phone: data.phone || null,
      documentNumber: data.documentNumber || null,
      hireDate: data.hireDate || null,
      active: data.isActive !== undefined ? data.isActive : true,
    };
    const response = await api.post("/users", payload);
    return response.data.data || response.data;
  },

  /**
   * Actualizar un usuario
   */
  async update(id: number, data: Partial<UserRecord>): Promise<UserRecord> {
    const payload = {
      firstName: data.fullName?.split(" ")[0],
      lastName: data.fullName?.split(" ").slice(1).join(" "),
      username: data.username,
      email: data.email,
      employeeCode: data.employeeCode,
      role: data.role,
      status: data.status,
      branchId: data.branchId,
      departmentId: data.departmentId,
      positionId: data.positionId,
      phone: data.phone,
      documentNumber: data.documentNumber,
      hireDate: data.hireDate,
      active: data.isActive,
    };
    // Eliminar campos undefined para no sobrescribir con null
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data || response.data;
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
