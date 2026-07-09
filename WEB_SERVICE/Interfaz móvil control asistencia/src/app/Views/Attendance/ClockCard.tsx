import { Clock } from "lucide-react";

function formatDate(d: Date) {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function ClockCard({ now }: { now: Date }) {
  const [h, m, s] = formatTime(now).split(":");
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-[#64748B]" />
        <span className="text-xs font-medium text-[#64748B] capitalize">
          {formatDate(now)}
        </span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-[44px] font-bold text-[#0F1523] leading-none tracking-tight tabular-nums">
          {h}:{m}
        </span>
        <span className="text-2xl font-semibold text-[#94A3B8] leading-none mb-1 tabular-nums">
          :{s}
        </span>
      </div>
    </div>
  );
}
