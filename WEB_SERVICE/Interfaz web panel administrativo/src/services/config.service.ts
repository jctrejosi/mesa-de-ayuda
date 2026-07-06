import api from "./api";
import type { ConfigSetting } from "../types";

export const configService = {
  /**
   * Obtener todas las configuraciones
   */
  async getAll(): Promise<ConfigSetting[]> {
    const response = await api.get<ConfigSetting[]>("/config");
    return response.data;
  },

  /**
   * Obtener una configuración por clave
   */
  async getByKey(key: string): Promise<ConfigSetting | null> {
    const response = await api.get<ConfigSetting>(`/config/${key}`);
    return response.data || null;
  },

  /**
   * Crear o actualizar una configuración
   */
  async upsert(data: {
    key: string;
    value: unknown;
    type?: string;
    description?: string;
  }): Promise<ConfigSetting> {
    const response = await api.post<ConfigSetting>("/config", data);
    return response.data;
  },

  /**
   * Actualizar una configuración por clave
   */
  async update(
    key: string,
    data: { value: unknown; type?: string; description?: string },
  ): Promise<ConfigSetting> {
    const response = await api.put<ConfigSetting>(`/config/${key}`, data);
    return response.data;
  },

  /**
   * Eliminar una configuración
   */
  async delete(key: string): Promise<void> {
    await api.delete(`/config/${key}`);
  },

  /**
   * Obtener configuración de geocerca (parseada)
   */
  async getGeolocationConfig(): Promise<{
    precisionThreshold: number;
    maxRadiusMeters: number;
  }> {
    const config = await this.getByKey("geolocation");
    if (!config || !config.settingValue) {
      return { precisionThreshold: 50, maxRadiusMeters: 500 };
    }
    try {
      return JSON.parse(config.settingValue);
    } catch {
      return { precisionThreshold: 50, maxRadiusMeters: 500 };
    }
  },

  /**
   * Obtener configuración de asistencia (parseada)
   */
  async getAttendanceConfig(): Promise<{
    workStartTime: string;
    workEndTime: string;
    toleranceMinutes: number;
    allowOutOfHours: boolean;
  }> {
    const config = await this.getByKey("attendance");
    if (!config || !config.settingValue) {
      return {
        workStartTime: "08:00",
        workEndTime: "17:00",
        toleranceMinutes: 15,
        allowOutOfHours: false,
      };
    }
    try {
      return JSON.parse(config.settingValue);
    } catch {
      return {
        workStartTime: "08:00",
        workEndTime: "17:00",
        toleranceMinutes: 15,
        allowOutOfHours: false,
      };
    }
  },
};
