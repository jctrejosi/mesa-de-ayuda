import { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Bell,
  ChevronDown,
  Users,
  XCircle,
  X,
  MapPin,
  CheckCircle2,
  ChevronRight,
  BarChart2,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import logo from "../assets/logo.png";
import { UsersView } from "./views/UsersView";
import { AttendanceView } from "./views/AttendanceView";
import { SalesView } from "./views/SalesView";
import { InventoryView } from "./views/InventoryView";

type ViewType = "attendance" | "users" | "sales" | "inventory";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

// ─── Toast System ─────────────────────────────────────────────────────────────

const ToastContainer = ({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
            t.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} className="text-green-600" />
          ) : (
            <XCircle size={16} className="text-red-600" />
          )}
          {t.message}
          <button
            onClick={() => dismiss(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({
  view,
  setView,
}: {
  view: ViewType;
  setView: (v: ViewType) => void;
}) => {
  const comercialItems = [
    { id: "sales", label: "Ventas", icon: BarChart2 },
    { id: "inventory", label: "Inventario", icon: Package },
  ];

  const adminItems = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "attendance", label: "Asistencia", icon: ClipboardList },
  ];

  const renderItems = (items: typeof comercialItems) =>
    items.map(({ id, label, icon: Icon }) => {
      const active = id === view;
      return (
        <button
          key={id}
          onClick={() => setView(id as ViewType)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
            active
              ? "bg-blue-600 text-white shadow-sm"
              : "hover:bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Icon size={16} />
          {label}
          {active && <ChevronRight size={13} className="ml-auto opacity-70" />}
        </button>
      );
    });

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        backgroundColor: "var(--sidebar)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src={logo}
              alt="DSI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              Mesa de ayuda
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}
            >
              DSI S.A.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2"
            style={{ color: "var(--sidebar-foreground)", opacity: 0.4 }}
          >
            Comercial
          </p>
          <div className="space-y-0.5">{renderItems(comercialItems)}</div>
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2"
            style={{ color: "var(--sidebar-foreground)", opacity: 0.4 }}
          >
            Administración
          </p>
          <div className="space-y-0.5">{renderItems(adminItems)}</div>
        </div>
      </nav>

      <div
        className="px-3 pb-4 border-t pt-4"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Juan Díaz</p>
            <p
              className="text-[10px] truncate"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}
            >
              Administrador
            </p>
          </div>
          <ChevronDown size={12} className="text-slate-500" />
        </div>
      </div>
    </aside>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar en el sistema…"
            className="h-8 pl-8 pr-4 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 w-52 transition-all"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors border border-border"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Notificaciones
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                    3 nuevas
                  </span>
                </div>
                {[
                  {
                    text: "2 registros rechazados pendientes de revisión",
                    time: "Hace 5 min",
                    icon: XCircle,
                    color: "text-red-500",
                  },
                  {
                    text: "Miguel Torres marcó asistencia fuera de geocerca",
                    time: "Hace 12 min",
                    icon: MapPin,
                    color: "text-amber-500",
                  },
                  {
                    text: "Exportación completada exitosamente",
                    time: "Hace 1h",
                    icon: CheckCircle2,
                    color: "text-green-500",
                  },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-border last:border-0"
                  >
                    <n.icon
                      size={15}
                      className={`${n.color} flex-shrink-0 mt-0.5`}
                    />
                    <div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {n.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            JD
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 leading-tight">
              Juan Díaz
            </p>
            <p className="text-[10px] text-slate-400">Administrador</p>
          </div>
          <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<ViewType>("sales");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Leer vista desde la URL al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view") as ViewType | null;
    if (
      viewParam &&
      ["attendance", "users", "sales", "inventory"].includes(viewParam)
    ) {
      setView(viewParam);
    }
  }, []);

  // Actualizar la URL al cambiar de vista
  const updateView = (newView: ViewType) => {
    setView(newView);
    const params = new URLSearchParams(window.location.search);
    params.set("view", newView);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const renderView = () => {
    switch (view) {
      case "attendance":
        return <AttendanceView />;
      case "users":
        return <UsersView />;
      case "sales":
        return <SalesView addToast={addToast} />;
      case "inventory":
        return <InventoryView addToast={addToast} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#F5F7FA" }}
    >
      <Sidebar view={view} setView={updateView} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          title={
            view === "attendance"
              ? "Asistencias"
              : view === "users"
                ? "Usuarios"
                : view === "inventory"
                  ? "Inventario"
                  : "Ventas"
          }
          subtitle={
            view === "attendance"
              ? "Martes, 12 de septiembre de 2023"
              : view === "users"
                ? "Gestiona los usuarios de la plataforma"
                : view === "inventory"
                  ? "Catálogo de productos y control de stock"
                  : "Resumen de facturación mensual"
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={
                view === "attendance" ||
                view === "sales" ||
                view === "inventory"
                  ? "space-y-5"
                  : ""
              }
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
