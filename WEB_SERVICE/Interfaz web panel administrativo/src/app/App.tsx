import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Users,
  Clock,
  AlertTriangle,
  XCircle,
  MoreVertical,
  X,
  Filter,
  Download,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Save,
  Map,
  LogIn,
  LogOut,
  Eye,
  SlidersHorizontal,
  ArrowUpRight,
  Wifi,
  Navigation,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = "approved" | "rejected" | "late";
type RecordType = "entry" | "exit";
type ViewType = "attendance" | "config";

interface Employee {
  id: string;
  name: string;
  code: string;
  role: string;
  avatar: string;
  initials: string;
  avatarColor: string;
}

interface AttendanceRecord {
  id: string;
  employee: Employee;
  date: string;
  time: string;
  type: RecordType;
  status: StatusType;
  distance: number;
  coordinates: { lat: number; lng: number };
  gpsAccuracy: number;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Ana Martínez",
    code: "EMP-001",
    role: "Gerente de Operaciones",
    avatar: "",
    initials: "AM",
    avatarColor: "#2563EB",
  },
  {
    id: "2",
    name: "Carlos Rivera",
    code: "EMP-002",
    role: "Analista de Sistemas",
    avatar: "",
    initials: "CR",
    avatarColor: "#7C3AED",
  },
  {
    id: "3",
    name: "Laura Sánchez",
    code: "EMP-003",
    role: "Coordinadora de RRHH",
    avatar: "",
    initials: "LS",
    avatarColor: "#DC2626",
  },
  {
    id: "4",
    name: "Miguel Torres",
    code: "EMP-004",
    role: "Desarrollador Senior",
    avatar: "",
    initials: "MT",
    avatarColor: "#16A34A",
  },
  {
    id: "5",
    name: "Valentina Cruz",
    code: "EMP-005",
    role: "Diseñadora UX",
    avatar: "",
    initials: "VC",
    avatarColor: "#F59E0B",
  },
  {
    id: "6",
    name: "Diego Morales",
    code: "EMP-006",
    role: "Contador",
    avatar: "",
    initials: "DM",
    avatarColor: "#0891B2",
  },
  {
    id: "7",
    name: "Sofía Herrera",
    code: "EMP-007",
    role: "Asistente Ejecutiva",
    avatar: "",
    initials: "SH",
    avatarColor: "#BE185D",
  },
  {
    id: "8",
    name: "Andrés López",
    code: "EMP-008",
    role: "Jefe de Ventas",
    avatar: "",
    initials: "AL",
    avatarColor: "#EA580C",
  },
];

const RECORDS: AttendanceRecord[] = [
  {
    id: "r1",
    employee: EMPLOYEES[0],
    date: "01/07/2026",
    time: "08:02",
    type: "entry",
    status: "approved",
    distance: 12,
    coordinates: { lat: -12.0464, lng: -77.0428 },
    gpsAccuracy: 4,
  },
  {
    id: "r2",
    employee: EMPLOYEES[1],
    date: "01/07/2026",
    time: "09:18",
    type: "entry",
    status: "late",
    distance: 45,
    coordinates: { lat: -12.0471, lng: -77.0435 },
    gpsAccuracy: 8,
  },
  {
    id: "r3",
    employee: EMPLOYEES[2],
    date: "01/07/2026",
    time: "08:01",
    type: "entry",
    status: "approved",
    distance: 8,
    coordinates: { lat: -12.0468, lng: -77.0431 },
    gpsAccuracy: 3,
  },
  {
    id: "r4",
    employee: EMPLOYEES[3],
    date: "01/07/2026",
    time: "08:45",
    type: "entry",
    status: "rejected",
    distance: 312,
    coordinates: { lat: -12.0512, lng: -77.0489 },
    gpsAccuracy: 15,
  },
  {
    id: "r5",
    employee: EMPLOYEES[4],
    date: "01/07/2026",
    time: "08:00",
    type: "entry",
    status: "approved",
    distance: 5,
    coordinates: { lat: -12.0463, lng: -77.0427 },
    gpsAccuracy: 2,
  },
  {
    id: "r6",
    employee: EMPLOYEES[0],
    date: "01/07/2026",
    time: "17:05",
    type: "exit",
    status: "approved",
    distance: 18,
    coordinates: { lat: -12.0465, lng: -77.0429 },
    gpsAccuracy: 5,
  },
  {
    id: "r7",
    employee: EMPLOYEES[5],
    date: "01/07/2026",
    time: "09:32",
    type: "entry",
    status: "late",
    distance: 22,
    coordinates: { lat: -12.0469, lng: -77.0432 },
    gpsAccuracy: 6,
  },
  {
    id: "r8",
    employee: EMPLOYEES[6],
    date: "01/07/2026",
    time: "08:03",
    type: "entry",
    status: "approved",
    distance: 9,
    coordinates: { lat: -12.0465, lng: -77.043 },
    gpsAccuracy: 3,
  },
  {
    id: "r9",
    employee: EMPLOYEES[7],
    date: "01/07/2026",
    time: "08:15",
    type: "entry",
    status: "rejected",
    distance: 289,
    coordinates: { lat: -12.0498, lng: -77.0471 },
    gpsAccuracy: 18,
  },
  {
    id: "r10",
    employee: EMPLOYEES[1],
    date: "30/06/2026",
    time: "17:02",
    type: "exit",
    status: "approved",
    distance: 14,
    coordinates: { lat: -12.0467, lng: -77.0431 },
    gpsAccuracy: 4,
  },
  {
    id: "r11",
    employee: EMPLOYEES[2],
    date: "30/06/2026",
    time: "09:05",
    type: "entry",
    status: "late",
    distance: 31,
    coordinates: { lat: -12.047, lng: -77.0433 },
    gpsAccuracy: 7,
  },
  {
    id: "r12",
    employee: EMPLOYEES[3],
    date: "30/06/2026",
    time: "08:00",
    type: "entry",
    status: "approved",
    distance: 7,
    coordinates: { lat: -12.0464, lng: -77.0428 },
    gpsAccuracy: 2,
  },
];

// ─── Utility Components ───────────────────────────────────────────────────────

const StatusChip = ({ status }: { status: StatusType }) => {
  const map = {
    approved: {
      label: "Aprobado",
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    rejected: {
      label: "Rechazado",
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
    late: {
      label: "Tarde",
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const RecordTypeChip = ({ type }: { type: RecordType }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${type === "entry" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}
  >
    {type === "entry" ? <LogIn size={11} /> : <LogOut size={11} />}
    {type === "entry" ? "Entrada" : "Salida"}
  </span>
);

const Avatar = ({
  employee,
  size = "md",
}: {
  employee: Employee;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: employee.avatarColor }}
    >
      {employee.initials}
    </div>
  );
};

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
  const items = [
    {
      id: "attendance",
      label: "Asistencia",
      icon: ClipboardList,
      view: "attendance" as ViewType,
    },
    {
      id: "config",
      label: "Configuración",
      icon: Settings,
      view: "config" as ViewType,
    },
  ];

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
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              DSI
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}
            >
              Módulo Asistencia
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2"
          style={{ color: "var(--sidebar-foreground)", opacity: 0.4 }}
        >
          Navegación
        </p>
        {items.map(({ id, label, icon: Icon, view: itemView }) => {
          const isActive =
            itemView === view || (id === "attendance" && view === "attendance");
          const active =
            id === "attendance"
              ? view === "attendance"
              : id === "config"
                ? view === "config"
                : false;
          return (
            <button
              key={id}
              onClick={() => itemView && setView(itemView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
              {active && (
                <ChevronRight size={13} className="ml-auto opacity-70" />
              )}
            </button>
          );
        })}
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

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const KPICard = ({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color,
  bgColor,
}: KPICardProps) => {
  const positive = delta >= 0;
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor}`}
        >
          <span className={color}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800 leading-none">
          {value}
        </p>
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}
        >
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {positive ? "+" : ""}
            {delta} {deltaLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface Filters {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

const FilterBar = ({
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

  return (
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
  );
};

// ─── Row Menu ─────────────────────────────────────────────────────────────────

const RowMenu = ({ onView }: { onView: () => void }) => {
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

// ─── Data Table ───────────────────────────────────────────────────────────────

const DataTable = ({
  records,
  onRowClick,
}: {
  records: AttendanceRecord[];
  onRowClick: (r: AttendanceRecord) => void;
}) => {
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
                  <Avatar employee={r.employee} size="sm" />
                  <span className="font-medium text-slate-700">
                    {r.employee.name}
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
                <RecordTypeChip type={r.type} />
              </td>
              <td className="px-4 py-3">
                <StatusChip status={r.status} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={`font-medium ${r.distance > 100 ? "text-red-600" : r.distance > 50 ? "text-amber-600" : "text-green-600"}`}
                >
                  {r.distance} m
                </span>
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <RowMenu onView={() => onRowClick(r)} />
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
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
            <p className="text-xs text-slate-400 mt-0.5">
              ID: {record.id.toUpperCase()}
            </p>
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
                { label: "Fecha", value: record.date },
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

// ─── Config Panel ─────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    style={{ height: "22px", width: "40px" }}
  >
    <span
      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200`}
      style={{
        width: "18px",
        height: "18px",
        transform: checked ? "translateX(18px)" : "translateX(2px)",
      }}
    />
  </button>
);

const ConfigPanel = ({
  addToast,
}: {
  addToast: (msg: string, type: "success" | "error") => void;
}) => {
  const [config, setConfig] = useState({
    seatName: "Sede Central Lima",
    lat: "-12.0464",
    lng: "-77.0428",
    radius: "150",
    entryTime: "08:00",
    exitTime: "17:30",
    tolerance: "10",
    validateLocation: true,
    allowManual: false,
    allowOutOfHours: false,
  });

  const update = (key: string, val: string | boolean) =>
    setConfig((c) => ({ ...c, [key]: val }));

  return (
    <div className="max-w-2xl space-y-5">
      {/* Geocerca */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapPin size={14} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Geocerca</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Nombre de la sede
            </label>
            <input
              type="text"
              value={config.seatName}
              onChange={(e) => update("seatName", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Latitud
              </label>
              <input
                type="text"
                value={config.lat}
                onChange={(e) => update("lat", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Longitud
              </label>
              <input
                type="text"
                value={config.lng}
                onChange={(e) => update("lng", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Radio permitido (metros)
              </label>
              <input
                type="number"
                value={config.radius}
                onChange={(e) => update("radius", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button className="h-9 w-full px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
                <Map size={13} /> Seleccionar en mapa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horario */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
            <Clock size={14} className="text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Horario</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Hora de entrada
            </label>
            <input
              type="time"
              value={config.entryTime}
              onChange={(e) => update("entryTime", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Hora de salida
            </label>
            <input
              type="time"
              value={config.exitTime}
              onChange={(e) => update("exitTime", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">
              Tolerancia (min)
            </label>
            <input
              type="number"
              value={config.tolerance}
              onChange={(e) => update("tolerance", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Validaciones */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <SlidersHorizontal size={14} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Validaciones</h3>
        </div>
        <div className="space-y-4">
          {[
            {
              key: "validateLocation",
              label: "Validación por ubicación",
              desc: "Requiere que el empleado esté dentro del radio de la geocerca.",
            },
            {
              key: "allowManual",
              label: "Permitir registro manual",
              desc: "Los administradores pueden registrar asistencia manualmente.",
            },
            {
              key: "allowOutOfHours",
              label: "Permitir registros fuera de horario",
              desc: "Acepta registros realizados fuera del horario establecido.",
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={config[key as keyof typeof config] as boolean}
                onChange={(v) => update(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          addToast("Configuración guardada exitosamente", "success")
        }
        className="h-10 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
      >
        <Save size={15} /> Guardar cambios
      </button>
    </div>
  );
};

// ─── Manual Registration Modal ────────────────────────────────────────────────

const ManualModal = ({
  onClose,
  addToast,
}: {
  onClose: () => void;
  addToast: (m: string, t: "success" | "error") => void;
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
              {EMPLOYEES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.code}
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

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<ViewType>("attendance");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [showManual, setShowManual] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    type: "",
    dateFrom: "",
    dateTo: "",
  });

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const filteredRecords = RECORDS.filter((r) => {
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
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#F5F7FA" }}
    >
      <Sidebar view={view} setView={setView} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          title={
            view === "attendance"
              ? "Módulo de Asistencia"
              : "Configuración del Módulo"
          }
          subtitle={
            view === "attendance"
              ? "Martes, 1 de julio de 2026 — Sede Central Lima"
              : "Gestiona geocerca, horarios y validaciones"
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {view === "attendance" ? (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <KPICard
                    label="Empleados presentes"
                    value={187}
                    delta={12}
                    deltaLabel="vs ayer"
                    icon={<Users size={18} />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  <KPICard
                    label="Pendientes por registrar"
                    value={24}
                    delta={-8}
                    deltaLabel="vs ayer"
                    icon={<Clock size={18} />}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                  />
                  <KPICard
                    label="Llegadas tardías"
                    value={9}
                    delta={3}
                    deltaLabel="vs ayer"
                    icon={<AlertTriangle size={18} />}
                    color="text-orange-500"
                    bgColor="bg-orange-50"
                  />
                  <KPICard
                    label="Registros rechazados"
                    value={4}
                    delta={-2}
                    deltaLabel="vs ayer"
                    icon={<XCircle size={18} />}
                    color="text-red-600"
                    bgColor="bg-red-50"
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

                <DataTable
                  records={filteredRecords}
                  onRowClick={setSelectedRecord}
                />
              </motion.div>
            ) : (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="mb-5">
                  <h2 className="text-sm font-semibold text-slate-700">
                    Configuración del módulo
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajusta los parámetros de geocerca, horario y reglas de
                    validación.
                  </p>
                </div>
                <ConfigPanel addToast={addToast} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

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

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
