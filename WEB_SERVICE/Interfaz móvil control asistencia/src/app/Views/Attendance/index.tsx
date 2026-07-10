// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

import { CheckCircle2, AlertTriangle, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth.context";
import { useAttendance } from "../../../hook/useAttendance";
import { ConfirmationModal } from "./ConfirmationModal";
import { TopBar } from "./TopBar";
import { EmployeeCard } from "./EmployeeCard";
import { MainButton } from "./MainButton";
import { InfoCard } from "./InfoCard";
import { LocationCard } from "./LocationCard";
import { ClockCard } from "./ClockCard";

type AppScreen = "loading" | "valid" | "invalid";
type AttendanceType = "entrada" | "salida";
type NavTab = "asistencia" | "historial" | "perfil";

function formatTime(d: Date) {
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function AttendanceScreen(handleModalContinue: {
  handleModalContinue: () => void;
}) {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [navTab, setNavTab] = useState<NavTab>("asistencia");
  const [now, setNow] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState("");
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>("entrada");
  const { user } = useAuth();

  /*
    { id: "loading", label: "Cargando" },
    { id: "valid", label: "Válido" },
    { id: "invalid", label: "No válido" },
    { id: "confirmed", label: "Confirmado" },
  */

  const { logout } = useAuth();

  const {
    status, // ← Solo de validateLocation
    precision,
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
    area: user?.area || "", // Podrías obtener esto del backend también
    avatar:
      user?.photo ||
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format&q=80",
  };

  useEffect(() => {
    if (status === "valid" && screen !== "valid") {
      setScreen("valid");
    } else if (status === "invalid" && screen !== "invalid") {
      setScreen("invalid");
    } else if (status === "loading" && screen !== "loading") {
      setScreen("loading");
    }
  }, [status]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRegister = useCallback(() => {
    setConfirmedTime(formatTime(now));
    setShowModal(true);
  }, [now]);

  return (
    <div className="relative w-full max-w-[430px] min-h-screen flex flex-col bg-[#F5F7FA] overflow-hidden">
      <TopBar
        onLogout={() => {
          logout();
          // El contexto manejará la redirección
        }}
      />
      <div
        className="flex-1 overflow-y-auto overscroll-contain space-y-3 pb-4 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        <EmployeeCard employee={employeeData} />
        <LocationCard screen={screen} precision={precision} />
        <ClockCard now={now} />
        <MainButton
          screen={screen}
          attendanceType={attendanceType}
          onPress={handleRegister}
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
              {screen === "valid" ? "Área permitida" : "Fuera del área"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#EFF3FF] text-[#2563EB]">
              <User size={11} />
              Sesión activa
            </span>
          </div>
        )}
      </div>
      {showModal && (
        <ConfirmationModal
          code={employeeData.code}
          type={attendanceType}
          time={confirmedTime}
          onContinue={() => handleModalContinue}
        />
      )}
    </div>
  );
}
