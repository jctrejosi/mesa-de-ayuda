// ════════════════════════════════════════════════════════════════════════
// ─── SALES VIEW ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

import {
  RefreshCw,
  Download,
  DollarSign,
  BarChart2,
  TrendingUp,
  TrendingDown,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  BarChart,
} from "recharts";
import { SaleMonth, SortDir } from "../../../types/sales.types";

import { useState } from "react";

const SALES_DATA: SaleMonth[] = [
  { month: "Enero", shortMonth: "Ene", value: 10_000_000, monthIndex: 0 },
  { month: "Febrero", shortMonth: "Feb", value: 12_500_000, monthIndex: 1 },
  { month: "Marzo", shortMonth: "Mar", value: 15_800_000, monthIndex: 2 },
  { month: "Abril", shortMonth: "Abr", value: 18_200_000, monthIndex: 3 },
  { month: "Mayo", shortMonth: "May", value: 16_400_000, monthIndex: 4 },
  { month: "Junio", shortMonth: "Jun", value: 19_700_000, monthIndex: 5 },
  { month: "Julio", shortMonth: "Jul", value: 42_300_000, monthIndex: 6 },
  { month: "Agosto", shortMonth: "Ago", value: 22_100_000, monthIndex: 7 },
  { month: "Septiembre", shortMonth: "Sep", value: 17_600_000, monthIndex: 8 },
  { month: "Octubre", shortMonth: "Oct", value: 14_900_000, monthIndex: 9 },
  { month: "Noviembre", shortMonth: "Nov", value: 13_500_000, monthIndex: 10 },
  { month: "Diciembre", shortMonth: "Dic", value: 10_500_000, monthIndex: 11 },
];

const CustomSalesTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const fmtCOP = (v: number, compact = false) => {
    if (compact) {
      if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    }
    return "$" + v.toLocaleString("es-CO");
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">
        {fmtCOP(payload[0].value)}
      </p>
    </div>
  );
};

const SortableTH = ({
  children,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  children: React.ReactNode;
  field: string;
  sortField: string | null;
  sortDir: SortDir;
  onSort: (f: string) => void;
}) => {
  const active = sortField === field;
  return (
    <th
      className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] whitespace-nowrap cursor-pointer hover:text-slate-700 select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span
          className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
        >
          {active && sortDir === "asc" ? (
            <ArrowUp size={10} />
          ) : active && sortDir === "desc" ? (
            <ArrowDown size={10} />
          ) : (
            <ArrowUpDown size={10} />
          )}
        </span>
      </div>
    </th>
  );
};

const KPICard = ({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color,
  bgColor,
  valueNode,
}: {
  label: string;
  value?: number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  valueNode?: React.ReactNode;
}) => {
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
        {valueNode ? (
          valueNode
        ) : (
          <p className="text-3xl font-bold text-slate-800 leading-none">
            {value}
          </p>
        )}
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

export const SalesView = ({
  addToast,
}: {
  addToast: (m: string, t: "success" | "error") => void;
}) => {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const total = SALES_DATA.reduce((s, m) => s + m.value, 0);
  const avg = Math.round(total / SALES_DATA.length);
  const maxM = SALES_DATA.reduce((a, b) => (a.value > b.value ? a : b));
  const minM = SALES_DATA.reduce((a, b) => (a.value < b.value ? a : b));

  const handleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const tableData = [...SALES_DATA].sort((a, b) => {
    if (!sortField) return a.monthIndex - b.monthIndex;
    const va = sortField === "month" ? a.monthIndex : a.value;
    const vb = sortField === "month" ? b.monthIndex : b.value;
    return sortDir === "asc"
      ? (va as number) - (vb as number)
      : (vb as number) - (va as number);
  });

  const participation = (v: number) => ((v / total) * 100).toFixed(1);

  const barColor = (m: SaleMonth) => {
    if (activeMonth !== null && m.monthIndex !== activeMonth) return "#CBD5E1";
    if (m.monthIndex === maxM.monthIndex) return "#16A34A";
    if (m.monthIndex === minM.monthIndex) return "#DC2626";
    return "#2563EB";
  };

  const fmtCOP = (v: number, compact = false) => {
    if (compact) {
      if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    }
    return "$" + v.toLocaleString("es-CO");
  };

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Resumen anual 2026
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comportamiento mensual de facturación
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              addToast("Datos actualizados correctamente", "success")
            }
            className="h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} /> Actualizar
          </button>
          <button
            onClick={() => addToast("Exportación CSV iniciada", "success")}
            className="h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total ventas anuales"
          delta={18}
          deltaLabel="vs año ant."
          icon={<DollarSign size={18} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
          valueNode={
            <p className="text-xl font-bold text-slate-800 leading-none">
              {fmtCOP(total, true)}
            </p>
          }
        />
        <KPICard
          label="Promedio mensual"
          delta={5}
          deltaLabel="vs año ant."
          icon={<BarChart2 size={18} />}
          color="text-purple-600"
          bgColor="bg-purple-50"
          valueNode={
            <p className="text-xl font-bold text-slate-800 leading-none">
              {fmtCOP(avg, true)}
            </p>
          }
        />
        <KPICard
          label="Mes mayor venta"
          delta={0}
          deltaLabel="Julio 2026"
          icon={<TrendingUp size={18} />}
          color="text-green-600"
          bgColor="bg-green-50"
          valueNode={
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{maxM.month}</p>
              <p className="text-xl font-bold text-slate-800 leading-none">
                {fmtCOP(maxM.value, true)}
              </p>
            </div>
          }
        />
        <KPICard
          label="Mes menor venta"
          delta={0}
          deltaLabel="Enero 2026"
          icon={<TrendingDown size={18} />}
          color="text-red-600"
          bgColor="bg-red-50"
          valueNode={
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{minM.month}</p>
              <p className="text-xl font-bold text-slate-800 leading-none">
                {fmtCOP(minM.value, true)}
              </p>
            </div>
          }
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Ventas por mes
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en una barra para destacarla en la tabla
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              Mayor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              Menor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
              Normal
            </span>
            {activeMonth !== null && (
              <button
                onClick={() => setActiveMonth(null)}
                className="ml-2 text-blue-600 hover:underline flex items-center gap-1"
              >
                <X size={11} />
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={SALES_DATA}
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            barSize={36}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="shortMonth"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              content={<CustomSalesTooltip />}
              cursor={{ fill: "#F8FAFC" }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              onClick={(data: any) =>
                setActiveMonth((prev: any) =>
                  prev === data.monthIndex ? null : data.monthIndex,
                )
              }
              style={{ cursor: "pointer" }}
            >
              {SALES_DATA.map((m) => (
                <Cell key={m.monthIndex} fill={barColor(m)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Detalle mensual
          </p>
          <p className="text-xs text-slate-400">
            Haz clic en encabezados para ordenar
          </p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <SortableTH
                field="month"
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Mes
              </SortableTH>
              <SortableTH
                field="value"
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Valor
              </SortableTH>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                % Participación
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                Tendencia
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((m, i) => {
              const prev = SALES_DATA.find(
                (x) => x.monthIndex === m.monthIndex - 1,
              );
              const trend = prev
                ? m.value >= prev.value
                  ? "up"
                  : "down"
                : "neutral";
              const pct = parseFloat(participation(m.value));
              const isHighlighted = activeMonth === m.monthIndex;
              return (
                <tr
                  key={m.monthIndex}
                  onClick={() =>
                    setActiveMonth((p) =>
                      p === m.monthIndex ? null : m.monthIndex,
                    )
                  }
                  className={`border-b border-border transition-colors cursor-pointer ${isHighlighted ? "bg-blue-50" : i % 2 === 1 ? "bg-slate-50/30 hover:bg-blue-50/30" : "hover:bg-blue-50/30"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isHighlighted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                      <span
                        className={`font-medium ${isHighlighted ? "text-blue-700" : "text-slate-700"}`}
                      >
                        {m.month}
                      </span>
                      {m.monthIndex === maxM.monthIndex && (
                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold ml-1">
                          Mayor
                        </span>
                      )}
                      {m.monthIndex === minM.monthIndex && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold ml-1">
                          Menor
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {fmtCOP(m.value)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-slate-600 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {trend === "up" && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp size={13} />
                        Subió
                      </span>
                    )}
                    {trend === "down" && (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <TrendingDown size={13} />
                        Bajó
                      </span>
                    )}
                    {trend === "neutral" && (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-700 text-xs">
                Total anual
              </td>
              <td className="px-4 py-3 font-bold text-blue-700 text-xs">
                {fmtCOP(total)}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                100%
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
