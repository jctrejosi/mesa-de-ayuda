import { LogIn, LogOut, MapPin, RefreshCw } from "lucide-react";

type AppScreen = "loading" | "valid" | "invalid" | "confirmed";
type AttendanceType = "entrada" | "salida";

export function MainButton({
  screen,
  attendanceType,
  onPress,
  onRetry,
  isRetrying = false,
  isLoading = false,
}: {
  screen: AppScreen;
  attendanceType: AttendanceType;
  onPress: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  isLoading?: boolean;
}) {
  const enabled = screen === "valid" && !isLoading && !isRetrying;
  const isEntrada = attendanceType === "entrada";
  const showRetry = (screen === "invalid" || screen === "loading") && onRetry;

  // Si está cargando (obteniendo ubicación)
  if (screen === "loading" && isLoading) {
    return (
      <div className="mx-4">
        <button
          disabled
          className="w-full h-[60px] rounded-[18px] flex items-center justify-center gap-3 font-semibold text-[16px] bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#94A3B8] border-t-transparent animate-spin" />
          Obteniendo ubicación…
        </button>
      </div>
    );
  }

  // Si está reintentando
  if (isRetrying) {
    return (
      <div className="mx-4">
        <button
          disabled
          className="w-full h-[60px] rounded-[18px] flex items-center justify-center gap-3 font-semibold text-[16px] bg-[#EFF3FF] text-[#2563EB] cursor-not-allowed"
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
          Reintentando ubicación…
        </button>
      </div>
    );
  }

  // Si la ubicación es inválida o hay error, mostrar botón de reintento
  if (showRetry) {
    return (
      <div className="mx-4">
        <button
          onClick={onRetry}
          className="w-full h-[60px] rounded-[18px] flex items-center justify-center gap-3 font-semibold text-[16px] bg-[#FEF2F2] text-[#DC2626] border-2 border-[#FECACA] hover:bg-[#FEE2E2] transition-colors active:scale-[0.98]"
        >
          <RefreshCw size={20} strokeWidth={2} />
          Reintentar ubicación
        </button>
        <p className="text-[11px] text-[#64748B] text-center mt-2">
          {screen === "loading"
            ? "La ubicación está tardando más de lo esperado"
            : "No se pudo validar tu ubicación. Intenta nuevamente."}
        </p>
      </div>
    );
  }

  // Botón principal de registro (habilitado cuando la ubicación es válida)
  return (
    <div className="mx-4">
      <button
        onClick={enabled ? onPress : undefined}
        disabled={!enabled}
        className={`w-full h-[60px] rounded-[18px] flex items-center justify-center gap-3 font-semibold text-[16px] transition-all duration-200 ${
          enabled
            ? "bg-[#2563EB] text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] active:scale-[0.98] hover:bg-[#1D4ED8]"
            : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
        }`}
      >
        {isEntrada ? (
          <LogIn size={20} strokeWidth={2} />
        ) : (
          <LogOut size={20} strokeWidth={2} />
        )}
        {isEntrada ? "Registrar Entrada" : "Registrar Salida"}
      </button>
    </div>
  );
}
