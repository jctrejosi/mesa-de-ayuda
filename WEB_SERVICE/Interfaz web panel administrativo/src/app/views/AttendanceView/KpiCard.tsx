// ─── KPI Cards ────────────────────────────────────────────────────────────────

import { KPICardProps } from "../../../types";
import { TrendingUp, TrendingDown } from "lucide-react";

export const KPICard = ({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color,
  bgColor,
}: KPICardProps) => {
  const positive = delta >= 0;
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor}`}
        >
          <span className={color}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800 leading-none">
          {value}
        </p>
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}
        >
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {positive ? "+" : ""}
            {delta} {deltaLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
