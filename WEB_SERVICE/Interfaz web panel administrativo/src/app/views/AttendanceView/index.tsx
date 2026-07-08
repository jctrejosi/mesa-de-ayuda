import { useState, useRef, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Users,
  Clock,
  AlertTriangle,
  XCircle,
  MoreVertical,
  X,
  Download,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  LogIn,
  LogOut,
  Eye,
  Wifi,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Hooks ────────────────────────────────────────────────────────────────────

import { useComparativeStats } from "../../../hooks/useComparativeStats";
import { useAttendanceRecords } from "../../../hooks/useAttendanceRecords";

// ─── Types ────────────────────────────────────────────────────────────────────

import { AttendanceRecord, Toast } from "../../../types";
import { FilterBar, Filters } from "./FilterBar";
import { DataTable } from "./DataTable";
import { KPICard } from "./KpiCard";

export const AttendanceView = () => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );

  const { stats, loading, error, refresh } = useComparativeStats();
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    total,
    refresh: recordsRefresh,
    loadMore,
    setFilters: setApiFilters,
  } = useAttendanceRecords({}, 20);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const filteredRecords = records.filter((r) => {
    if (
      filters.search &&
      !r.employee.name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  });

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Empleados presentes"
          value={stats?.present.today || 0}
          delta={stats?.present.yesterday || 0}
          deltaLabel="vs ayer"
          icon={<Users size={18} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Pendientes por registrar"
          value={stats?.pending.today || 0}
          delta={stats?.pending.yesterday || 0}
          deltaLabel="vs ayer"
          icon={<Clock size={18} />}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <KPICard
          label="Llegadas tardías"
          value={stats?.late.today || 0}
          delta={stats?.late.yesterday || 0}
          deltaLabel="vs ayer"
          icon={<AlertTriangle size={18} />}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Historial de Asistencias
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualiza y gestiona todos los registros de asistencia
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Aprobado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Tarde
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Rechazado
          </span>
        </div>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onExport={() =>
          addToast(
            "Exportación iniciada. El archivo estará listo en breve.",
            "success",
          )
        }
        onManual={() => setShowManual(true)}
      />

      <DataTable records={filteredRecords} onRowClick={setSelectedRecord} />
    </>
  );
};
