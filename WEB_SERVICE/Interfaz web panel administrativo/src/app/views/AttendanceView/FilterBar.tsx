// ─── Filter Bar ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { AttendanceRecord, Toast } from "../../../types";
import { Search, Calendar, Download, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { DetailModal } from "./DetailModal";
import { ManualModal } from "./ManualModal";

export interface Filters {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

export const FilterBar = ({
  filters,
  setFilters,
  onExport,
  onManual,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onExport: () => void;
  onManual: () => void;
}) => {
  const update = (key: keyof Filters, val: string) =>
    setFilters({ ...filters, [key]: val });

  const [showManual, setShowManual] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {selectedRecord && (
          <DetailModal
            key="detail"
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
        {showManual && (
          <ManualModal
            key="manual"
            onClose={() => setShowManual(false)}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-40">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar empleado…"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar size={13} />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="h-8 px-2 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="h-8 px-2 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="late">Tarde</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => update("type", e.target.value)}
          className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          <option value="entry">Entrada</option>
          <option value="exit">Salida</option>
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onExport}
            className="h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            Exportar
          </button>
          <button
            onClick={onManual}
            className="h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={13} />
            Registrar asistencia manual
          </button>
        </div>
      </div>
    </>
  );
};
