import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "../contexts/auth.context";
import { LoginScreen } from "./Views/Login";
import { AttendanceScreen } from "./Views/Attendance";
import { InventoryScreen } from "./Views/Inventory";
import { BottomNav } from "./BottomNav";
import { useEffect, useState } from "react";

type NavTab = "asistencia" | "historial" | "inventario" | "perfil";

const AppContent = () => {
  const { isAuthenticated, isLoading, user, isAdmin, isEmployee } = useAuth();
  const [navTab, setNavTab] = useState<NavTab>("asistencia");
  const [isHealthChecking, setIsHealthChecking] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      try {
        const response = await fetch(`${apiUrl}/api-status`);
        if (response.ok) {
          console.log("✅ Health check exitoso");
        } else {
          setHealthError(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        setHealthError("No se pudo conectar con el servidor");
        console.error("❌ Health check falló:", error);
      } finally {
        setIsHealthChecking(false);
      }
    };

    checkHealth();
  }, []);

  console.log("🔍 AppContent State:", {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    isEmployee,
    role: user?.role,
    isHealthChecking,
    healthError,
  });

  // Mostrar pantalla de carga mientras se verifica el health check
  if (isHealthChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[#2563EB] animate-spin" />
          <p className="text-[#64748B] font-medium">
            Verificando conexión con el servidor...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si el health check falló
  if (healthError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="w-20 h-20 rounded-full bg-[#FEE2E2] flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F1523]">
            Error de conexión
          </h2>
          <p className="text-[#64748B] text-sm">{healthError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-[#2563EB] text-white font-semibold rounded-[12px] hover:bg-[#1D4ED8] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
    window.location.href = import.meta.env.VITE_ADMIN_URL;
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

  // Función para navegar al inventario desde el modal de asistencia
  const handleModalContinue = () => {
    console.log("📱 Navegando a inventario desde asistencia");
    setNavTab("inventario");
  };

  // Empleado o manager → mostrar las pantallas según navTab
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="min-h-screen bg-[#F5F7FA] flex items-start justify-center">
        {/* Contenido según la pestaña activa */}
        {navTab === "asistencia" && (
          <AttendanceScreen handleModalContinue={handleModalContinue} />
        )}
        {navTab === "inventario" && <InventoryScreen />}
        {navTab === "historial" && (
          <div className="w-full max-w-[430px] min-h-screen flex items-center justify-center">
            <p className="text-[#64748B]">Pantalla de Historial</p>
          </div>
        )}
        {navTab === "perfil" && (
          <div className="w-full max-w-[430px] min-h-screen flex items-center justify-center">
            <p className="text-[#64748B]">Pantalla de Perfil</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
