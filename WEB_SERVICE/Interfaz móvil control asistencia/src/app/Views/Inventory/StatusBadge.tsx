const STATUS_CONFIG = {
  available: {
    label: "Disponible",
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#16A34A]",
  },
  low: {
    label: "Bajo stock",
    bg: "bg-[#FEF9C3]",
    text: "text-[#A16207]",
    dot: "bg-[#CA8A04]",
  },
  out: {
    label: "Agotado",
    bg: "bg-[#FEE2E2]",
    text: "text-[#B91C1C]",
    dot: "bg-[#DC2626]",
  },
};

type ItemStatus = "available" | "low" | "out";

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: ItemStatus;
  size?: "sm" | "xs";
}) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${c.bg} ${c.text}
      ${size === "xs" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-0.5"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
