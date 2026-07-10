import {
  MapPin,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";

type AttendanceType = "entrada" | "salida";

export function ConfirmationModal({
  type,
  time,
  onContinue = () => {},
  code,
}: {
  type: AttendanceType;
  time: string;
  onContinue?: () => void;
  code: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] p-6 pb-10 animate-[slideUp_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4 shadow-[0_0_0_8px_#DCFCE7]">
            <CheckCircle2
              size={40}
              className="text-[#16A34A]"
              strokeWidth={1.8}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#15803D] text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <CheckCircle2 size={12} />
            Registro exitoso
          </span>
          <h2 className="text-xl font-bold text-[#0F1523]">
            {type === "entrada" ? "Entrada registrada" : "Salida registrada"}
          </h2>
          <p className="text-[#64748B] text-sm mt-1">
            Tu asistencia ha sido confirmada
          </p>
          <div className="w-full mt-6 bg-[#F8FAFC] rounded-[16px] p-4 space-y-3">
            {[
              {
                icon: <Clock size={15} />,
                label: "Hora registrada",
                value: time,
              },
              {
                icon:
                  type === "entrada" ? (
                    <LogIn size={15} />
                  ) : (
                    <LogOut size={15} />
                  ),
                label: "Tipo de registro",
                value: type === "entrada" ? "Entrada" : "Salida",
              },
              {
                icon: <MapPin size={15} />,
                label: "Ubicación",
                value: "Área autorizada ✓",
                color: "text-[#16A34A]",
              },
              {
                icon: <Shield size={15} />,
                label: "Empleado",
                value: code,
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748B]">
                  {icon}
                  <span className="text-xs">{label}</span>
                </div>
                <span
                  className={`text-xs font-semibold ${color ?? "text-[#0F1523]"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              onContinue();
            }}
            className="w-full mt-5 h-[52px] rounded-[16px] bg-[#2563EB] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:bg-[#1D4ED8] transition-colors"
          >
            Continuar
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
