import { api } from "./api";

export interface RegisterAttendanceDto {
  checkType: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  checkType: string;
  createdAt: string;
  attendanceId: number;
  distance?: number;
}

export interface CanRegisterResponse {
  canRegister: boolean;
  alreadyRegistered: boolean;
  type: string;
  message?: string;
}

export interface AttendanceStats {
  total: number;
  entries: number;
  exits: number;
  breaks: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

export interface AttendanceHistoryResponse {
  records: any[];
  total: number;
  limit: number;
  offset: number;
}

export interface ValidateLocationDto {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ValidateLocationResponse {
  isValid: boolean;
  message: string;
  distance: number;
  maxRadius: number;
  branch: {
    id: number;
    name: string;
    address: string | null;
    latitude: string;
    longitude: string;
    allowedRadius: number;
  } | null;
}

export class AttendanceService {
  /**
   * Registrar asistencia (ENTRY/EXIT)
   * POST /attendance/register
   */
  static async register(
    data: RegisterAttendanceDto,
  ): Promise<AttendanceResponse> {
    console.log("📋 [Attendance] Registrando:", data);

    const response = await api.post("/attendance/register", data);
    const result = response.data.data || response.data;

    console.log("📋 [Attendance] Respuesta:", result);
    return result;
  }

  /**
   * Verificar si puede registrar hoy
   * GET /attendance/can-register/:type
   */
  static async canRegister(
    type: "ENTRY" | "EXIT",
  ): Promise<CanRegisterResponse> {
    const response = await api.get(`/attendance/can-register/${type}`);
    const data = response.data.data || response.data;
    return data;
  }

  /**
   * Obtener asistencia de hoy
   * GET /attendance/today
   */
  static async getToday(): Promise<any[]> {
    const response = await api.get("/attendance/today");
    const data = response.data.data || response.data;
    return data;
  }

  /**
   * Obtener historial de asistencia
   * GET /attendance/history
   */
  static async getHistory(
    limit: number = 10,
    offset: number = 0,
  ): Promise<AttendanceHistoryResponse> {
    const response = await api.get(
      `/attendance/history?limit=${limit}&offset=${offset}`,
    );
    const data = response.data.data || response.data;
    return data;
  }

  /**
   * Obtener estadísticas de asistencia
   * GET /attendance/stats
   */
  static async getStats(): Promise<AttendanceStats> {
    const response = await api.get("/attendance/stats");
    const data = response.data.data || response.data;
    return data;
  }

  /**
   * Validar ubicación sin registrar
   * POST /attendance/validate-location
   */
  static async validateLocation(
    data: ValidateLocationDto,
  ): Promise<ValidateLocationResponse> {
    console.log("📍 [Attendance] Validando ubicación:", data);

    const response = await api.post("/attendance/validate-location", data);
    const result = response.data.data || response.data;

    console.log("📍 [Attendance] Respuesta validación:", result);
    return result;
  }
}
