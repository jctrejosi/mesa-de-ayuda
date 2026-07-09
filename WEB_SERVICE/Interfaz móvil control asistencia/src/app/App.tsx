import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "../contexts/auth.context";
import { LoginScreen } from "./Views/Login";
import { AttendanceScreen } from "./Views/Attendance";
import { BottomNav } from "./BottomNav";
import { useState } from "react";

type NavTab = "asistencia" | "historial" | "perfil";

const AppContent = () => {
  const { isAuthenticated, isLoading, user, isAdmin, isEmployee } = useAuth();
  const [navTab, setNavTab] = useState<NavTab>("asistencia");

  console.log("🔍 AppContent State:", {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    isEmployee,
    role: user?.role,
  });

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[#2563EB] animate-spin" />
          <p className="text-[#64748B] font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <LoginScreen />
      </div>
    );
  }

  // Si es admin, mostrar pantalla de carga (ya redirigió desde el login)
  // Pero por si acaso, también redirigimos aquí
  if (isAdmin) {
    // Redirigir si por alguna razón no se hizo en el login
    console.log("🚀 Redirigiendo a administración desde AppContent...");
    window.location.href = "http://localhost:5174";
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[#2563EB] animate-spin" />
          <p className="text-[#64748B] font-medium">
            Redirigiendo al panel de administración...
          </p>
        </div>
      </div>
    );
  }

  // Empleado o manager → AttendanceScreen
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="min-h-screen bg-[#F5F7FA] flex items-start justify-center">
        <AttendanceScreen />
        {/*<BottomNav active={navTab} onSelect={setNavTab} /> */}
      </div>
    </div>
  );
};
// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
