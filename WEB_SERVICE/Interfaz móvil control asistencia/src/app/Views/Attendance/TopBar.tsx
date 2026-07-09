import { LogOut } from "lucide-react";

export function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-4">
      <div>
        <p className="text-xs font-medium text-[#64748B] tracking-widest uppercase">
          Mesa de Ayuda
        </p>
        <h1 className="text-lg font-semibold text-[#0F1523]">
          Control de Asistencia
        </h1>
      </div>
      <button
        onClick={onLogout}
        className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/[0.06] flex items-center justify-center text-[#475569] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
        title="Cerrar sesión"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
