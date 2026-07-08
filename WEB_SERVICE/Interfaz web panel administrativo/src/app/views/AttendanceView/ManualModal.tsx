// ─── Manual Registration Modal ────────────────────────────────────────────────

import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Employee } from "../../../types";

export const ManualModal = ({
  onClose,
  addToast,
  employees = [],
}: {
  onClose: () => void;
  addToast: (m: string, t: "success" | "error") => void;
  employees?: Employee[];
}) => {
  const [form, setForm] = useState({
    employee: "",
    date: "",
    time: "",
    type: "entry",
    reason: "",
  });

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
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">
            Registrar asistencia manual
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Empleado
            </label>
            <select
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
            >
              <option value="">Seleccionar empleado…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.id}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Hora
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Tipo de registro
            </label>
            <div className="flex gap-2">
              {["entry", "exit"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 h-9 rounded-lg text-xs font-medium border transition-colors ${form.type === t ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-border text-slate-600 hover:bg-slate-100"}`}
                >
                  {t === "entry" ? "Entrada" : "Salida"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Motivo / observación
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              placeholder="Describe el motivo del registro manual…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 resize-none transition-all"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg border border-border text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              addToast("Asistencia registrada exitosamente", "success");
              onClose();
            }}
            className="h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Registrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
