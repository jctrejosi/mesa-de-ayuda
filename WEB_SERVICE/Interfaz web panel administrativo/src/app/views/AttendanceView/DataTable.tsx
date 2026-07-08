import { ClipboardList, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { AttendanceRecord } from "../../../types";
import { Avatar, RecordTypeChip, StatusChip } from "./UtilsComponents";

interface DataTableProps {
  records: AttendanceRecord[];
  onRowClick: (r: AttendanceRecord) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export const DataTable = ({
  records,
  onRowClick,
  onLoadMore,
  hasMore,
  loading,
}: DataTableProps) => {
  const lastItemRef = useRef<HTMLTableRowElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getInitials = (fullName: string): string => {
    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Observador para el último elemento (scroll infinito)
  useEffect(() => {
    if (!lastItemRef.current || !hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observerRef.current.observe(lastItemRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [records, hasMore, loading, onLoadMore]);

  if (records.length === 0 && !loading) {
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
      {/* Contenedor con scroll */}
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-border">
              {["Empleado", "Código", "Fecha", "Hora", "Tipo", "Estado"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const isLast = i === records.length - 1;
              return (
                <tr
                  key={r.id}
                  ref={isLast ? lastItemRef : null}
                  className={`border-b border-border hover:bg-blue-50/40 transition-colors cursor-pointer ${
                    i % 2 === 1 ? "bg-slate-50/30" : ""
                  }`}
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
                    <RecordTypeChip
                      type={r.type === "entry" ? "entry" : "exit"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Cargando más (spinner) */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={24} className="text-blue-500 animate-spin" />
            <span className="ml-2 text-sm text-slate-500">
              Cargando más registros...
            </span>
          </div>
        )}
      </div>

      {/* Footer con contador y botón "Ver más" */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-slate-50">
        <p className="text-xs text-slate-400">
          {records.length} registros encontrados
        </p>
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Cargando...
              </>
            ) : (
              "Ver más"
            )}
          </button>
        )}
        {!hasMore && records.length > 0 && (
          <span className="text-xs text-slate-400">No hay más registros</span>
        )}
      </div>
    </div>
  );
};
