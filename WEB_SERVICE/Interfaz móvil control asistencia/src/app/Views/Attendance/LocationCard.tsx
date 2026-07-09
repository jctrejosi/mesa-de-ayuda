import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
type AppScreen = "loading" | "valid" | "invalid" | "confirmed";
type AttendanceType = "entrada" | "salida";
type GpsPrecision = "excellent" | "good" | "low";

export function LocationCard({
  screen,
  precision,
}: {
  screen: AppScreen;
  precision: GpsPrecision | null;
}) {
  const isLoading = screen === "loading";
  const isValid = screen === "valid" || screen === "confirmed";
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] p-5">
      {isLoading ? (
        <div className="flex flex-col items-center py-3 gap-3">
          <div className="w-14 h-14 rounded-full bg-[#EFF3FF] flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-[3px] border-[#2563EB] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0F1523] text-[15px]">
              Obteniendo ubicación…
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verificando señal GPS
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 shrink-0 rounded-[16px] flex items-center justify-center ${isValid ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]"}`}
          >
            <MapPin
              size={26}
              className={isValid ? "text-[#16A34A]" : "text-[#DC2626]"}
              strokeWidth={2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`font-semibold text-[15px] ${isValid ? "text-[#15803D]" : "text-[#B91C1C]"}`}
              >
                {isValid ? "Ubicación verificada" : "Fuera del área"}
              </p>
              {isValid ? (
                <CheckCircle2 size={16} className="text-[#16A34A]" />
              ) : (
                <AlertTriangle size={16} className="text-[#DC2626]" />
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              {isValid
                ? "Te encuentras dentro del área autorizada."
                : "Acércate a tu lugar de trabajo para registrar la asistencia."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
