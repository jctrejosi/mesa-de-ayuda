import { useState } from "react";

// ─── Components ──────────────────────────────────────────────────────────────
import { Users, Clock, AlertTriangle } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { DataTable } from "./DataTable";
import { KPICard } from "./KpiCard";
import { DetailModal } from "./DetailModal";

// ─── Hooks ──────────────────────────────────────────────────────────────────
import { useComparativeStats } from "../../../hooks/useComparativeStats";
import { useAttendanceRecords } from "../../../hooks/useAttendanceRecords";

// ─── Types ──────────────────────────────────────────────────────────────────
import { AttendanceRecord, Filters, Toast } from "../../../types";
import { AnimatePresence } from "motion/react";

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
    hasMore,
    setFilters: setApiFilters,
  } = useAttendanceRecords({}, 20);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  // ✅ Cuando los filtros de UI cambian, los enviamos al backend
  const handleApplyFilters = () => {
    const apiFilters: any = {};
    if (filters.search) apiFilters.search = filters.search;
    if (filters.status) {
      // Convertir a mayúsculas para el backend
      const statusMap: Record<string, string> = {
        approved: "APPROVED",
        late: "LATE",
        rejected: "REJECTED",
      };
      apiFilters.status = statusMap[filters.status] || filters.status;
    }
    if (filters.type) {
      apiFilters.type = filters.type === "entry" ? "ENTRY" : "EXIT";
    }
    if (filters.dateFrom) apiFilters.startDate = filters.dateFrom;
    if (filters.dateTo) apiFilters.endDate = filters.dateTo;

    setApiFilters(apiFilters);
  };

  // ✅ También aplicar cuando cambie algún filtro individual (opcional, pero recomendado)
  // Podemos llamar a handleApplyFilters en cada cambio, o dejar que el usuario presione "Enter" o un botón "Aplicar".
  // Para mejor UX, podríamos aplicar los filtros automáticamente después de un debounce.

  return (
    <>
      <AnimatePresence>
        {selectedRecord && (
          <DetailModal
            key="detail"
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
        {/* Aquí iría el modal manual si lo tienes */}
      </AnimatePresence>

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
            {total} registros encontrados
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

      {/* FilterBar - pasamos handleApplyFilters como callback */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
        onExport={() =>
          addToast(
            "Exportación iniciada. El archivo estará listo en breve.",
            "success",
          )
        }
        onManual={() => setShowManual(true)}
      />

      {/* DataTable con scroll infinito */}
      <DataTable
        records={records}
        onRowClick={setSelectedRecord}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={recordsLoading}
      />
    </>
  );
};
