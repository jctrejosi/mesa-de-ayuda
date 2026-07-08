// ─── Detail Modal ─────────────────────────────────────────────────────────────

import { X, MapPin, Wifi, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { AttendanceRecord } from "../../../types";
import { Avatar, StatusChip } from "./UtilsComponents";

export const DetailModal = ({
  record,
  onClose,
}: {
  record: AttendanceRecord;
  onClose: () => void;
}) => {
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
            <Avatar employee={record.employee} size="lg" />
            <div>
              <p className="font-semibold text-slate-800">
                {record.employee.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {record.employee.role}
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
                { label: "Fecha", value: record.accuracy },
                { label: "Hora", value: record.time },
                {
                  label: "Tipo",
                  value: record.type === "entry" ? "Entrada" : "Salida",
                },
                {
                  label: "Estado",
                  value: <StatusChip status={record.status} />,
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

          {/* Location */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Ubicación
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                {
                  label: "Latitud",
                  value: record.coordinates.lat.toFixed(4),
                  icon: Navigation,
                },
                {
                  label: "Longitud",
                  value: record.coordinates.lng.toFixed(4),
                  icon: Navigation,
                },
                {
                  label: "Distancia",
                  value: `${record.distance} m`,
                  icon: MapPin,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon size={10} className="text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-medium">
                      {label}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 font-mono">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <Wifi size={12} className="text-slate-400" />
              <p className="text-xs text-slate-500">Precisión GPS:</p>
              <p className="text-xs font-semibold text-slate-700">
                {record.gpsAccuracy} m
              </p>
              <span
                className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${record.gpsAccuracy <= 5 ? "bg-green-100 text-green-700" : record.gpsAccuracy <= 10 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
              >
                {record.gpsAccuracy <= 5
                  ? "Alta precisión"
                  : record.gpsAccuracy <= 10
                    ? "Precisión media"
                    : "Baja precisión"}
              </span>
            </div>
          </div>

          {/* Map placeholder */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Mapa
            </p>
            <div className="rounded-xl overflow-hidden border border-border h-44 bg-blue-50 relative flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Geocerca circle */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-blue-400 bg-blue-100/40 flex items-center justify-center">
                  <div
                    className={`w-3 h-3 rounded-full shadow-lg ${record.distance > 100 ? "bg-red-500" : "bg-blue-600"}`}
                    style={{
                      transform: `translate(${Math.min(record.distance / 3, 48)}px, ${Math.min(record.distance / 5, 32)}px)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-500 text-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1" />
                  Sede
                  <span className="ml-3 w-2 h-2 rounded-full bg-blue-500 inline-block mr-1" />
                  Empleado
                </div>
              </div>
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
