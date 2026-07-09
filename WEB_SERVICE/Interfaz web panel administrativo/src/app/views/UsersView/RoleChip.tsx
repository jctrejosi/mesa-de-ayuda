import {
  Search,
  Users,
  AlertTriangle,
  XCircle,
  X,
  Plus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Save,
  Eye,
  UserCog,
  ShieldCheck,
  QrCode,
  Paperclip,
  Lock,
  Briefcase,
  UserCheck,
  UserX,
  Edit3,
  PauseCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type UserRole = "admin" | "manager" | "employee";

export const RoleChip = ({ role }: { role: UserRole }) => {
  const map: Record<
    UserRole,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    admin: {
      label: "Admin",
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: <ShieldCheck size={10} />,
    },
    manager: {
      label: "Manager",
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <UserCog size={10} />,
    },
    employee: {
      label: "Empleado",
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: <Users size={10} />,
    },
  };
  const s = map[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};
