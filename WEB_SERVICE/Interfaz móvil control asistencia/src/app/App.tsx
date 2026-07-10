import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "../contexts/auth.context";
import { LoginScreen } from "./Views/Login";
import { AttendanceScreen } from "./Views/Attendance";
import { InventoryScreen } from "./Views/Inventory";
import { useState, useEffect } from "react";

type NavTab = "asistencia" | "historial" | "inventario" | "perfil";

// Clave para localStorage
const NAV_TAB_STORAGE_KEY = "app_nav_tab";

const AppContent = () => {
  const { isAuthenticated, isLoading, user, isAdmin, isEmployee } = useAuth();

  // Inicializar navTab desde localStorage o con valor por defecto
  const [navTab, setNavTab] = useState<NavTab>(() => {
    const savedTab = localStorage.getItem(NAV_TAB_STORAGE_KEY) as NavTab;
    // Validar que el valor guardado sea válido
    if (
      savedTab &&
      ["asistencia", "historial", "inventario", "perfil"].includes(savedTab)
    ) {
      return savedTab;
    }
    return "asistencia";
  });

  console.log("🔍 AppContent State:", {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    isEmployee,
    role: user?.role,
    navTab,
  });

  // Guardar en localStorage cada vez que cambie la pestaña
  useEffect(() => {
    localStorage.setItem(NAV_TAB_STORAGE_KEY, navTab);
  }, [navTab]);

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

  // Función para navegar al inventario desde el modal de asistencia
  const handleModalContinue = () => {
    console.log("📱 Navegando a inventario desde asistencia");
    setNavTab("inventario");
  };

  // Función para cambiar de pestaña (con persistencia automática por el useEffect)
  const handleNavChange = (tab: NavTab) => {
    setNavTab(tab);
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
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
