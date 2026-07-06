import api from "./api";
import type {
  DashboardStats,
  AttendanceChartData,
  RecentAttendance,
  DepartmentStats,
  TopPunctualEmployee,
} from "../types";

export const dashboardService = {
  /**
   * Obtener estadísticas generales
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  /**
   * Obtener datos del gráfico de asistencia
   */
  async getChart(days: number = 7): Promise<AttendanceChartData[]> {
    const response = await api.get<AttendanceChartData[]>("/dashboard/chart", {
      params: { days },
    });
    return response.data;
  },

  /**
   * Obtener registros recientes
   */
  async getRecent(limit: number = 10): Promise<RecentAttendance[]> {
    const response = await api.get<RecentAttendance[]>("/dashboard/recent", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Obtener estadísticas por departamento
   */
  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const response = await api.get<DepartmentStats[]>("/dashboard/departments");
    return response.data;
  },

  /**
   * Obtener el top de empleados más puntuales
   */
  async getTopPunctual(limit: number = 5): Promise<TopPunctualEmployee[]> {
    const response = await api.get<TopPunctualEmployee[]>(
      "/dashboard/top-punctual",
      { params: { limit } },
    );
    return response.data;
  },
};
