// ─── Row Menu ─────────────────────────────────────────────────────────────────

import { MoreVertical, Eye, CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";

export const RowMenu = ({ onView }: { onView: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-border z-50 py-1 overflow-hidden"
          >
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Eye size={12} /> Ver detalle
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              <CheckCircle2 size={12} /> Aprobar
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
              <XCircle size={12} /> Rechazar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
