// ─── Utility Components ───────────────────────────────────────────────────────

import { LogIn, LogOut } from "lucide-react";
import { Employee, RecordType, StatusType } from "../../../types";

export const StatusChip = ({ status }: { status: StatusType }) => {
  const map = {
    approved: {
      label: "Aprobado",
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    rejected: {
      label: "Rechazado",
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
    late: {
      label: "Tarde",
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
  };
  const s = map[status] || map["approved"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const RecordTypeChip = ({ type }: { type: RecordType }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${type === "entry" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}
  >
    {type === "entry" ? <LogIn size={11} /> : <LogOut size={11} />}
    {type === "entry" ? "Entrada" : "Salida"}
  </span>
);

export const Avatar = ({
  initials,
  size = "md",
  avatarColor,
}: {
  avatarColor?: string;
  initials: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: avatarColor || "#4F46E5" }}
    >
      {initials}
    </div>
  );
};
