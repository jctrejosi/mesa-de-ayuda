import api from "./api";
import type {
  AttendanceRecord,
  AttendanceWithRelations,
  AttendanceListResponse,
  ComparativeStats,
  AttendanceHistoryQueryParams,
} from "../types";

export const attendanceService = {
  /**
   * Obtener todos los registros (admin) con filtros
   */
  async findAll(params?: {
    startDate?: string;
    endDate?: string;
    type?: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
    employeeId?: number;
    branchId?: number;
    limit?: number;
    offset?: number;
    orderBy?: "createdAt" | "checkType" | "distance";
    orderDirection?: "ASC" | "DESC";
  }): Promise<AttendanceListResponse> {
    const response = await api.get<AttendanceListResponse>(
      "/attendance/admin",
      { params },
    );
    return response.data;
  },

  /**
   * Obtener un registro por ID
   */
  async findById(id: number): Promise<AttendanceWithRelations> {
    const response = await api.get<AttendanceWithRelations>(
      `/attendance/admin/${id}`,
    );
    return response.data;
  },

  /**
   * Actualizar un registro (admin)
   */
  async update(
    id: number,
    data: Partial<AttendanceRecord>,
  ): Promise<AttendanceRecord> {
    const response = await api.put<AttendanceRecord>(
      `/attendance/admin/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Eliminar un registro (admin)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/attendance/admin/${id}`);
  },

  /**
   * Obtener registros de un empleado específico (para el historial)
   */
  async getEmployeeHistory(
    employeeId: number,
    params?: Omit<AttendanceListResponse, "employeeId">,
  ): Promise<AttendanceListResponse> {
    const response = await api.get<AttendanceListResponse>(
      "/attendance/history/employee",
      {
        params: { ...params, employeeId },
      },
    );
    return response.data;
  },

  /**
   * Historial avanzado con paginación, filtros y estado calculado
   * POST /attendance/history
   *
   * @param params - Filtros y paginación
   * @returns Historial avanzado con foto, nombre, código, sucursal y estado
   *
   * @example
   * const result = await attendanceService.getAdvancedHistory({
   *   page: 1,
   *   limit: 20,
   *   startDate: '2026-06-01',
   *   endDate: '2026-07-08',
   *   type: 'ENTRY',
   *   status: 'APPROVED',
   *   search: 'Ana'
   * });
   */
  async getAttendanceHistory(
    params: AttendanceHistoryQueryParams,
  ): Promise<AttendanceListResponse> {
    console.log("📋 [Attendance] Obteniendo historial avanzado:", params);

    const response = await api.post<AttendanceListResponse>(
      "/attendance/history",
      params,
    );

    const data = response.data;

    return data;
  },

  async getComparativeStats(): Promise<ComparativeStats> {
    console.log("📊 [Attendance] Obteniendo estadísticas comparativas...");

    const response = await api.get("/attendance/stats");
    const data = response.data.data || response.data;

    console.log("📊 [Attendance] Estadísticas:", data);
    return data;
  },
};
