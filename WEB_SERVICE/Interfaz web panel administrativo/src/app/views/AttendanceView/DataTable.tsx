// ─── Data Table ───────────────────────────────────────────────────────────────
import { ClipboardList } from "lucide-react";
import { AttendanceWithRelations } from "../../../types";
import { Avatar, RecordTypeChip, StatusChip } from "./UtilsComponents";

export const DataTable = ({
  records,
  onRowClick,
}: {
  records: AttendanceWithRelations[];
  onRowClick: (r: AttendanceWithRelations) => void;
}) => {
  const getInitials = (fullName: string): string => {
    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
          <ClipboardList size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">Sin registros</p>
        <p className="text-xs text-slate-400 text-center max-w-xs">
          No se encontraron registros que coincidan con los filtros
          seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            {[
              "Empleado",
              "Código",
              "Fecha",
              "Hora",
              "Tipo",
              "Estado",
              "Distancia",
              "Acciones",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-border hover:bg-blue-50/40 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
              onClick={() => onRowClick(r)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    initials={getInitials(r.employee.fullName)}
                    size="sm"
                  />
                  <span className="font-medium text-slate-700">
                    {r.employee.fullName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                  {r.employee.code}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                {r.date}
              </td>
              <td className="px-4 py-3 font-mono font-medium text-slate-700">
                {r.time}
              </td>
              <td className="px-4 py-3">
                <RecordTypeChip type={r.type === "ENTRY" ? "entry" : "exit"} />
              </td>
              <td className="px-4 py-3">
                <StatusChip
                  status={r.status === "APPROVED" ? "approved" : "rejected"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {records.length} registros encontrados
        </p>
        <div className="flex items-center gap-1">
          {["1", "2", "3"].map((p) => (
            <button
              key={p}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === "1" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
