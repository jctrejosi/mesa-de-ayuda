import { useState, useRef, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Bell,
  ChevronDown,
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
  ChevronRight,
  Save,
  Map,
  LogIn,
  LogOut,
  Eye,
  SlidersHorizontal,
  Wifi,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = "approved" | "rejected" | "late";
type RecordType = "entry" | "exit";
type ViewType = "attendance" | "users";

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

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

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
    <>
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

      <DataTable records={filteredRecords} onRowClick={setSelectedRecord} />
    </>
  );
};
