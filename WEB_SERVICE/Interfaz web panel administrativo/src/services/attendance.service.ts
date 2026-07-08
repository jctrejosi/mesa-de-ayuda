import api from "./api";
import type {
  AttendanceRecord,
  AttendanceListResponse,
  ComparativeStats,
  AttendanceHistoryQueryParams,
} from "../types";

export const attendanceService = {
  /**
   * Historial de asistencias
   */
  async findAll(
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

  /**
   * Obtener un registro por ID
   */
  async findById(id: number): Promise<AttendanceRecord> {
    const response = await api.get<AttendanceRecord>(`/attendance/admin/${id}`);
    return response.data;
  },

  /**
   * Obtener historial de asistencias de un empleado
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
   * Obtener estadísticas diarias
   */
  async getStats(): Promise<ComparativeStats> {
    console.log("📊 [Attendance] Obteniendo estadísticas comparativas...");

    const response = await api.get("/attendance/stats");
    const data = response.data.data || response.data;

    console.log("📊 [Attendance] Estadísticas:", data);
    return data;
  },
};
