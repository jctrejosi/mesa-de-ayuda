// ─── Detail Modal ─────────────────────────────────────────────────────────────

import { X, MapPin, Wifi, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { AttendanceWithRelations } from "../../../types";
import { Avatar, StatusChip } from "./UtilsComponents";

const statusMap = {
  APPROVED: "approved",
  LATE: "late",
  REJECTED: "rejected",
} as const;

export const DetailModal = ({
  record,
  onClose,
}: {
  record: AttendanceWithRelations;
  onClose: () => void;
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Detalle de registro
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">ID: {record.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Employee */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Avatar
              avatarColor="blue"
              initials={getInitials(record.employee.fullName)}
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-800">
                {record.employee.fullName}
              </p>
              <span className="font-mono text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                {record.employee.code}
              </span>
            </div>
          </div>

          {/* Record info */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Información del Registro
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Fecha", value: record.date },
                { label: "Hora", value: record.time },
                {
                  label: "Tipo",
                  value:
                    record.type === "ENTRY"
                      ? "Entrada"
                      : record.type === "EXIT"
                        ? "Salida"
                        : record.type === "BREAK_START"
                          ? "Inicio de descanso"
                          : record.type === "BREAK_END"
                            ? "Fin de descanso"
                            : record.type,
                },
                {
                  label: "Estado",
                  value: (
                    <StatusChip
                      status={
                        record.status === "APPROVED" ? "approved" : "rejected"
                      }
                    />
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-medium mb-1">
                    {label}
                  </p>
                  {typeof value === "string" ? (
                    <p className="text-sm font-semibold text-slate-700">
                      {value}
                    </p>
                  ) : (
                    value
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-border text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
          <button className="h-8 px-4 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 flex items-center gap-1.5 transition-colors">
            <CheckCircle2 size={12} /> Aprobar registro
          </button>
        </div>
      </motion.div>
    </div>
  );
};
