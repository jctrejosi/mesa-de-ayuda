// Attendance/index.tsx (parte relevante)

import { CheckCircle2, AlertTriangle, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth.context";
import { useAttendance } from "../../../hook/useAttendance";
import { AttendanceService } from "../../../services/attendance.service";
import { ConfirmationModal } from "./ConfirmationModal";
import { TopBar } from "./TopBar";
import { EmployeeCard } from "./EmployeeCard";
import { MainButton } from "./MainButton";
import { InfoCard } from "./InfoCard";
import { LocationCard } from "./LocationCard";
import { ClockCard } from "./ClockCard";

type AppScreen = "loading" | "valid" | "invalid";
type AttendanceType = "entrada" | "salida";

function formatTime(d: Date) {
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function AttendanceScreen({
  handleModalContinue,
}: {
  handleModalContinue: () => void;
}) {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [now, setNow] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState("");
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>("entrada");
  const [canRegisterStatus, setCanRegisterStatus] = useState<{
    canRegister: boolean;
    alreadyRegistered: boolean;
    type?: string;
    message?: string;
  } | null>(null);
  const [isCheckingCanRegister, setIsCheckingCanRegister] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const { user, logout } = useAuth();

  const {
    status,
    location,
    precision,
    validation,
    error,
    isLoading,
    isRegistering,
    registerAttendance,
    retry,
  } = useAttendance();

  const employeeData = {
    name: user?.fullName || user?.username || "Usuario",
    code: user?.employeeId
      ? `EMP-${String(user.employeeId).padStart(4, "0")}`
      : "EMP-0000",
    role:
      user?.role === "admin"
        ? "Administrador"
        : user?.role === "manager"
          ? "Gerente"
          : "Agente de Mesa de Ayuda",
    area: user?.area || "",
    avatar:
      user?.photo ||
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format&q=80",
  };

  const checkCanRegister = useCallback(
    async (type: "ENTRY" | "EXIT") => {
      setIsCheckingCanRegister(true);
      try {
        const response = await AttendanceService.canRegister(type);
        setCanRegisterStatus(response);

        console.log("📋 [canRegister] Respuesta:", response);

        if (response.alreadyRegistered) {
          console.log(
            "⏰ Ya registró asistencia hoy, redirigiendo a inventario...",
          );
          handleModalContinue();
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error verificando canRegister:", error);
        return false;
      } finally {
        setIsCheckingCanRegister(false);
      }
    },
    [handleModalContinue],
  );

  useEffect(() => {
    if (status === "valid" && location) {
      const checkType = attendanceType === "entrada" ? "ENTRY" : "EXIT";
      checkCanRegister(checkType);
    }
  }, [status, location, attendanceType, checkCanRegister]);

  useEffect(() => {
    if (status === "loading") setScreen("loading");
    else if (status === "valid") setScreen("valid");
    else if (status === "invalid") setScreen("invalid");
    else if (status === "error") setScreen("invalid");
  }, [status]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRegister = useCallback(async () => {
    if (screen !== "valid") {
      alert("No estás en el área autorizada para registrar asistencia.");
      return;
    }

    if (!location) {
      alert(
        "No se pudo obtener la ubicación. Por favor, espera unos segundos e intenta de nuevo.",
      );
      return;
    }

    const checkType = attendanceType === "entrada" ? "ENTRY" : "EXIT";
    const alreadyRegistered = await checkCanRegister(checkType);
    if (alreadyRegistered) {
      return;
    }

    try {
      const response = await registerAttendance(checkType);

      if (response?.success) {
        setConfirmedTime(formatTime(now));
        setShowModal(true);
      } else {
        alert(response?.message || "Error al registrar asistencia.");
      }
    } catch (err: any) {
      console.error("Error en registro:", err);
      alert(
        err?.message || "Ocurrió un error al registrar. Inténtalo de nuevo.",
      );
    }
  }, [
    screen,
    location,
    attendanceType,
    now,
    registerAttendance,
    checkCanRegister,
  ]);

  // 👇 Manejar reintento desde el botón
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      setCanRegisterStatus(null);
      await retry();

      if (status === "valid" && location) {
        const checkType = attendanceType === "entrada" ? "ENTRY" : "EXIT";
        await checkCanRegister(checkType);
      }
    } catch (error) {
      console.error("Error al reintentar:", error);
    } finally {
      setIsRetrying(false);
    }
  }, [retry, status, location, attendanceType, checkCanRegister]);

  const handleConfirmContinue = () => {
    handleModalContinue();
    setAttendanceType((prev) => (prev === "entrada" ? "salida" : "entrada"));
    setShowModal(false);
  };

  return (
    <div className="relative w-full max-w-[430px] min-h-screen flex flex-col bg-[#F5F7FA] overflow-hidden">
      <TopBar onLogout={logout} />

      <div
        className="flex-1 overflow-y-auto overscroll-contain space-y-3 pb-4 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        <EmployeeCard employee={employeeData} />
        <LocationCard screen={screen} precision={precision} />
        <ClockCard now={now} />

        {/* 👇 MainButton con soporte para reintento */}
        <MainButton
          screen={screen}
          attendanceType={attendanceType}
          onPress={handleRegister}
          onRetry={handleRetry}
          isLoading={isLoading || isCheckingCanRegister}
          isRetrying={isRetrying}
        />

        <InfoCard />

        {screen !== "loading" && (
          <div className="mx-4 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                screen === "valid"
                  ? "bg-[#DCFCE7] text-[#15803D]"
                  : "bg-[#FEE2E2] text-[#B91C1C]"
              }`}
            >
              {screen === "valid" ? (
                <CheckCircle2 size={11} />
              ) : (
                <AlertTriangle size={11} />
              )}
              {screen === "valid"
                ? "Área permitida"
                : error || "Fuera del área"}
            </span>

            {canRegisterStatus && (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                  canRegisterStatus.alreadyRegistered
                    ? "bg-[#FEE2E2] text-[#B91C1C]"
                    : "bg-[#DCFCE7] text-[#15803D]"
                }`}
              >
                {canRegisterStatus.alreadyRegistered ? (
                  <AlertTriangle size={11} />
                ) : (
                  <CheckCircle2 size={11} />
                )}
                {canRegisterStatus.alreadyRegistered
                  ? `Ya registraste ${canRegisterStatus.type === "ENTRY" ? "entrada" : "salida"}`
                  : "Puedes registrar"}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#EFF3FF] text-[#2563EB]">
              <User size={11} /> Sesión activa
            </span>
          </div>
        )}
      </div>

      {showModal && (
        <ConfirmationModal
          code={employeeData.code}
          type={attendanceType}
          time={confirmedTime}
          onContinue={handleConfirmContinue}
        />
      )}
    </div>
  );
}
