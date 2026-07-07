import { useState, useEffect, useCallback } from "react";
import {
  LocationService,
  LocationData,
  GpsPrecision,
} from "../services/location.service";
import {
  AttendanceService,
  ValidateLocationResponse,
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
  validation: ValidateLocationResponse | null;
  error: string | null;
  isLoading: boolean;
  isRegistering: boolean;
  registerAttendance: (type: "ENTRY" | "EXIT") => Promise<any>;
  retry: () => void;
}

export function useAttendance(): UseAttendanceReturn {
  const [status, setStatus] = useState<AttendanceStatus>("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [precision, setPrecision] = useState<GpsPrecision | null>(null);
  const [validation, setValidation] = useState<ValidateLocationResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const locationService = LocationService.getInstance();

  /**
   * ✅ ÚNICO MÉTODO: Obtiene ubicación y la valida con el backend
   */
  const validateLocation = useCallback(async () => {
    setIsLoading(true);
    setStatus("loading");
    setError(null);
    setValidation(null);

    try {
      // 1. Obtener ubicación GPS
      console.log("📍 [useAttendance] Obteniendo ubicación GPS...");
      const loc = await locationService.getCurrentPosition();
      setLocation(loc);
      console.log("📍 [useAttendance] Ubicación obtenida:", loc);

      // 2. Calcular precisión
      const prec = locationService.getPrecision(loc.accuracy);
      setPrecision(prec);
      console.log("📍 [useAttendance] Precisión:", prec);

      // 3. VALIDAR UBICACIÓN CON EL BACKEND
      console.log("📍 [useAttendance] Validando ubicación con el backend...");
      const validationResult = await AttendanceService.validateLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
      });
      setValidation(validationResult);
      console.log("📍 [useAttendance] Resultado validación:", validationResult);

      // 4. Actualizar estado según validación
      if (validationResult.isValid) {
        setStatus("valid");
        console.log("✅ [useAttendance] Ubicación válida");
      } else {
        setStatus("invalid");
        console.log(
          "❌ [useAttendance] Ubicación inválida:",
          validationResult.message,
        );
      }
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
    async (type: "ENTRY" | "EXIT") => {
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
        return result;
      } catch (err: any) {
        console.error("❌ [useAttendance] Error al registrar:", err);
        throw err;
      } finally {
        setIsRegistering(false);
      }
    },
    [location],
  );

  /**
   * Reintentar validación
   */
  const retry = useCallback(() => {
    validateLocation();
  }, [validateLocation]);

  // ✅ Solo se ejecuta UNA VEZ al montar el componente
  useEffect(() => {
    validateLocation();
  }, []);

  return {
    status,
    location,
    precision,
    validation,
    error,
    isLoading,
    isRegistering,
    registerAttendance,
    retry,
  };
}
