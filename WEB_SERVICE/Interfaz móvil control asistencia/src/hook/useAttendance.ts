import { useState, useEffect, useCallback } from "react";
import {
  LocationService,
  LocationData,
  GpsPrecision,
} from "../services/location.service";
import {
  AttendanceService,
  AttendanceResponse,
} from "../services/attendance.service";

export type AttendanceStatus =
  | "idle"
  | "loading"
  | "valid"
  | "invalid"
  | "error";

export interface UseAttendanceReturn {
  status: AttendanceStatus;
  location: LocationData | null;
  precision: GpsPrecision | null;
  error: string | null;
  isLoading: boolean;
  isRegistering: boolean;
  canRegister: boolean;
  todayEntries: number;
  todayExits: number;
  lastRegister: string | null;
  registerAttendance: (type: "ENTRY" | "EXIT") => Promise<AttendanceResponse>;
  retry: () => void;
}

export function useAttendance(): UseAttendanceReturn {
  const [status, setStatus] = useState<AttendanceStatus>("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [precision, setPrecision] = useState<GpsPrecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [todayEntries, setTodayEntries] = useState(0);
  const [todayExits, setTodayExits] = useState(0);
  const [lastRegister, setLastRegister] = useState<string | null>(null);

  const locationService = LocationService.getInstance();

  /**
   * Obtiene ubicación y verifica si puede registrar
   */
  const checkAttendance = useCallback(async () => {
    setIsLoading(true);
    setStatus("loading");
    setError(null);

    try {
      // 1. Verificar si puede registrar
      console.log("🔍 [useAttendance] Verificando si puede registrar...");
      const canRegisterResult = await AttendanceService.canRegister("ENTRY");
      console.log("🔍 [useAttendance] canRegister:", canRegisterResult);
      setCanRegister(canRegisterResult.canRegister);

      // 2. Obtener ubicación GPS
      console.log("📍 [useAttendance] Obteniendo ubicación GPS...");
      const loc = await locationService.getCurrentPosition();
      setLocation(loc);
      console.log("📍 [useAttendance] Ubicación obtenida:", loc);

      // 3. Calcular precisión
      const prec = locationService.getPrecision(loc.accuracy);
      setPrecision(prec);
      console.log("📍 [useAttendance] Precisión:", prec);

      // 4. Obtener asistencias de hoy
      console.log("📊 [useAttendance] Obteniendo asistencias de hoy...");
      const today = await AttendanceService.getToday();
      const entries = today.filter((a) => a.checkType === "ENTRY").length;
      const exits = today.filter((a) => a.checkType === "EXIT").length;
      setTodayEntries(entries);
      setTodayExits(exits);

      setStatus("valid");
      console.log("✅ [useAttendance] Listo para registrar");
    } catch (err: any) {
      console.error("❌ [useAttendance] Error:", err);
      setError(err.message || "Error al obtener ubicación");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Registrar asistencia (ENTRY o EXIT)
   */
  const registerAttendance = useCallback(
    async (type: "ENTRY" | "EXIT"): Promise<AttendanceResponse> => {
      if (!location) {
        throw new Error("No hay ubicación disponible");
      }

      setIsRegistering(true);

      try {
        console.log("📋 [useAttendance] Registrando:", type);

        const result = await AttendanceService.register({
          checkType: type,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        });

        console.log("📋 [useAttendance] Registro exitoso:", result);

        // Actualizar contadores
        setLastRegister(result.createdAt);
        if (type === "ENTRY") {
          setTodayEntries((prev) => prev + 1);
        } else {
          setTodayExits((prev) => prev + 1);
        }
        setCanRegister(false);

        return result;
      } catch (err: any) {
        console.error("❌ [useAttendance] Error al registrar:", err);

        // Si el error dice que está fuera del área
        const errorData = err.response?.data?.data || err.response?.data;
        if (errorData?.message?.includes("Fuera del área")) {
          setStatus("invalid");
        }

        throw err;
      } finally {
        setIsRegistering(false);
      }
    },
    [location],
  );

  /**
   * Reintentar
   */
  const retry = useCallback(() => {
    checkAttendance();
  }, [checkAttendance]);

  // Iniciar al montar
  useEffect(() => {
    checkAttendance();
  }, []);

  return {
    status,
    location,
    precision,
    error,
    isLoading,
    isRegistering,
    canRegister,
    todayEntries,
    todayExits,
    lastRegister,
    registerAttendance,
    retry,
  };
}
