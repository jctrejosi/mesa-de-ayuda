type UserStatus = "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";

export const UserStatusChip = ({ status }: { status: UserStatus }) => {
  const map: Record<
    UserStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    ACTIVE: {
      label: "Activo",
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    INACTIVE: {
      label: "Inactivo",
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
    VACATION: {
      label: "Vacaciones",
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-400",
    },
    SUSPENDED: {
      label: "Suspendido",
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};
