import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogIn,
  LogOut,
  Info,
  User,
  History,
  Home,
  X,
  Signal,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Building2,
  LayoutGrid,
  ChevronDown,
  Star,
} from "lucide-react";
type NavTab = "asistencia" | "historial" | "perfil";
export function BottomNav({
  active,
  onSelect,
}: {
  active: NavTab;
  onSelect: (t: NavTab) => void;
}) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "asistencia",
      label: "Asistencia",
      icon: <Home size={22} strokeWidth={1.8} />,
    },
    {
      id: "historial",
      label: "Historial",
      icon: <History size={22} strokeWidth={1.8} />,
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: <User size={22} strokeWidth={1.8} />,
    },
  ];
  return (
    <div className="bg-white border-t border-black/[0.06] flex pb-8 pt-2 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${active === tab.id ? "text-[#2563EB]" : "text-[#94A3B8]"}`}
        >
          {tab.icon}
          <span className="text-[10px] font-semibold tracking-wide">
            {tab.label}
          </span>
          {active === tab.id && (
            <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
          )}
        </button>
      ))}
    </div>
  );
}
