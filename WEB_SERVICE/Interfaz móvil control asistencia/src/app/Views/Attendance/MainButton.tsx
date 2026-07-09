import { LogIn, LogOut, MapPin } from "lucide-react";

type AppScreen = "loading" | "valid" | "invalid" | "confirmed";
type AttendanceType = "entrada" | "salida";

export function MainButton({
  screen,
  attendanceType,
  onPress,
}: {
  screen: AppScreen;
  attendanceType: AttendanceType;
  onPress: () => void;
}) {
  const enabled = screen === "valid";
  const isEntrada = attendanceType === "entrada";
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
        {enabled ? (
          <>
            {isEntrada ? (
              <LogIn size={20} strokeWidth={2} />
            ) : (
              <LogOut size={20} strokeWidth={2} />
            )}
            {isEntrada ? "Registrar Entrada" : "Registrar Salida"}
          </>
        ) : screen === "loading" ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-[#94A3B8] border-t-transparent animate-spin" />
            Obteniendo ubicación…
          </>
        ) : (
          <>
            <MapPin size={20} />
            No disponible
          </>
        )}
      </button>
    </div>
  );
}
