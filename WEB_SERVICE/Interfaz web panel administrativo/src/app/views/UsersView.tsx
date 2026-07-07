import { useState, useRef } from "react";
import {
  Search,
  Users,
  AlertTriangle,
  XCircle,
  X,
  Plus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Save,
  Eye,
  UserCog,
  ShieldCheck,
  QrCode,
  Paperclip,
  Lock,
  Briefcase,
  UserCheck,
  UserX,
  Edit3,
  PauseCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type UserStatus = "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
type UserRole = "admin" | "manager" | "employee";

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  username: string;
  employeeCode: string;
  role: UserRole;
  status: UserStatus;
  branchName: string;
  department: string;
  position: string;
  phone: string;
  document: string;
  hireDate: string;
  lastLogin: string;
  isActive: boolean;
  initials: string;
  avatarColor: string;
}

interface UserFiltersState {
  search: string;
  role: string;
  status: string;
  branch: string;
  department: string;
}

// ─── Mock Data — Users ────────────────────────────────────────────────────────

const CURRENT_ADMIN_ID = "u1";

const INITIAL_USERS: UserRecord[] = [
  {
    id: "u1",
    fullName: "Juan Díaz",
    email: "juan.diaz@corpERP.com",
    username: "jdiaz",
    employeeCode: "ADM-001",
    role: "admin",
    status: "ACTIVE",
    branchName: "Sede Central Lima",
    department: "Tecnología",
    position: "Administrador de Sistemas",
    phone: "+51 987 654 321",
    document: "DNI 45678901",
    hireDate: "15/03/2020",
    lastLogin: "01/07/2026 08:45",
    isActive: true,
    initials: "JD",
    avatarColor: "#2563EB",
  },
  {
    id: "u2",
    fullName: "Ana Martínez",
    email: "ana.martinez@corpERP.com",
    username: "amartinez",
    employeeCode: "EMP-001",
    role: "manager",
    status: "ACTIVE",
    branchName: "Sede Central Lima",
    department: "Operaciones",
    position: "Gerente de Operaciones",
    phone: "+51 976 543 210",
    document: "DNI 32145678",
    hireDate: "02/06/2018",
    lastLogin: "01/07/2026 08:02",
    isActive: true,
    initials: "AM",
    avatarColor: "#7C3AED",
  },
  {
    id: "u3",
    fullName: "Carlos Rivera",
    email: "carlos.rivera@corpERP.com",
    username: "crivera",
    employeeCode: "EMP-002",
    role: "employee",
    status: "ACTIVE",
    branchName: "Sede Norte",
    department: "Tecnología",
    position: "Analista de Sistemas",
    phone: "+51 965 432 109",
    document: "DNI 76543210",
    hireDate: "10/01/2021",
    lastLogin: "01/07/2026 09:18",
    isActive: true,
    initials: "CR",
    avatarColor: "#16A34A",
  },
  {
    id: "u4",
    fullName: "Laura Sánchez",
    email: "laura.sanchez@corpERP.com",
    username: "lsanchez",
    employeeCode: "EMP-003",
    role: "manager",
    status: "VACATION",
    branchName: "Sede Central Lima",
    department: "Recursos Humanos",
    position: "Coordinadora de RRHH",
    phone: "+51 954 321 098",
    document: "DNI 21098765",
    hireDate: "05/09/2019",
    lastLogin: "25/06/2026 17:30",
    isActive: true,
    initials: "LS",
    avatarColor: "#DC2626",
  },
  {
    id: "u5",
    fullName: "Miguel Torres",
    email: "miguel.torres@corpERP.com",
    username: "mtorres",
    employeeCode: "EMP-004",
    role: "employee",
    status: "SUSPENDED",
    branchName: "Sede Sur",
    department: "Tecnología",
    position: "Desarrollador Senior",
    phone: "+51 943 210 987",
    document: "DNI 87654321",
    hireDate: "20/04/2022",
    lastLogin: "15/06/2026 09:00",
    isActive: false,
    initials: "MT",
    avatarColor: "#F59E0B",
  },
  {
    id: "u6",
    fullName: "Valentina Cruz",
    email: "valentina.cruz@corpERP.com",
    username: "vcruz",
    employeeCode: "EMP-005",
    role: "employee",
    status: "ACTIVE",
    branchName: "Sede Central Lima",
    department: "Diseño",
    position: "Diseñadora UX",
    phone: "+51 932 109 876",
    document: "DNI 54321098",
    hireDate: "14/07/2023",
    lastLogin: "01/07/2026 08:00",
    isActive: true,
    initials: "VC",
    avatarColor: "#0891B2",
  },
  {
    id: "u7",
    fullName: "Diego Morales",
    email: "diego.morales@corpERP.com",
    username: "dmorales",
    employeeCode: "EMP-006",
    role: "employee",
    status: "INACTIVE",
    branchName: "Sede Norte",
    department: "Finanzas",
    position: "Contador",
    phone: "+51 921 098 765",
    document: "DNI 10987654",
    hireDate: "03/11/2017",
    lastLogin: "10/06/2026 16:45",
    isActive: false,
    initials: "DM",
    avatarColor: "#BE185D",
  },
  {
    id: "u8",
    fullName: "Sofía Herrera",
    email: "sofia.herrera@corpERP.com",
    username: "sherrera",
    employeeCode: "EMP-007",
    role: "employee",
    status: "ACTIVE",
    branchName: "Sede Sur",
    department: "Administración",
    position: "Asistente Ejecutiva",
    phone: "+51 910 987 654",
    document: "DNI 98765432",
    hireDate: "28/02/2024",
    lastLogin: "30/06/2026 17:05",
    isActive: true,
    initials: "SH",
    avatarColor: "#EA580C",
  },
  {
    id: "u9",
    fullName: "Andrés López",
    email: "andres.lopez@corpERP.com",
    username: "alopez",
    employeeCode: "EMP-008",
    role: "manager",
    status: "ACTIVE",
    branchName: "Sede Norte",
    department: "Ventas",
    position: "Jefe de Ventas",
    phone: "+51 909 876 543",
    document: "DNI 65432109",
    hireDate: "12/08/2016",
    lastLogin: "01/07/2026 07:58",
    isActive: true,
    initials: "AL",
    avatarColor: "#7C3AED",
  },
];

const BRANCHES = ["Sede Central Lima", "Sede Norte", "Sede Sur"];
const DEPARTMENTS = [
  "Tecnología",
  "Operaciones",
  "Recursos Humanos",
  "Finanzas",
  "Diseño",
  "Administración",
  "Ventas",
];

// ─── Shared Utility Components ────────────────────────────────────────────────

const UserStatusChip = ({ status }: { status: UserStatus }) => {
  const map: Record<
    UserStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    ACTIVE: {
      label: "Activo",
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    INACTIVE: {
      label: "Inactivo",
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
    VACATION: {
      label: "Vacaciones",
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-400",
    },
    SUSPENDED: {
      label: "Suspendido",
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
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

const RoleChip = ({ role }: { role: UserRole }) => {
  const map: Record<
    UserRole,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    admin: {
      label: "Admin",
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: <ShieldCheck size={10} />,
    },
    manager: {
      label: "Manager",
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <UserCog size={10} />,
    },
    employee: {
      label: "Empleado",
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: <Users size={10} />,
    },
  };
  const s = map[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

const Avatar = ({
  user,
  size = "md",
}: {
  user: { initials: string; avatarColor: string };
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
      style={{ backgroundColor: user.avatarColor }}
    >
      {user.initials}
    </div>
  );
};

// ─── Toggle Switch ───────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    style={{ width: "40px", height: "22px" }}
  >
    <span
      className="absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200"
      style={{
        width: "18px",
        height: "18px",
        transform: checked ? "translateX(18px)" : "translateX(2px)",
      }}
    />
  </button>
);

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const KPICard = ({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) => {
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

// ─── User Filter Bar ──────────────────────────────────────────────────────────

const UserFilterBar = ({
  filters,
  setFilters,
  onCreateUser,
}: {
  filters: UserFiltersState;
  setFilters: (f: UserFiltersState) => void;
  onCreateUser: () => void;
}) => {
  const up = (k: keyof UserFiltersState, v: string) =>
    setFilters({ ...filters, [k]: v });
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-44">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Nombre, email o código…"
          value={filters.search}
          onChange={(e) => up("search", e.target.value)}
          className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
        />
      </div>
      <select
        value={filters.role}
        onChange={(e) => up("role", e.target.value)}
        className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
      >
        <option value="">Todos los roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="employee">Empleado</option>
      </select>
      <select
        value={filters.status}
        onChange={(e) => up("status", e.target.value)}
        className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVE">Activo</option>
        <option value="INACTIVE">Inactivo</option>
        <option value="VACATION">Vacaciones</option>
        <option value="SUSPENDED">Suspendido</option>
      </select>
      <select
        value={filters.branch}
        onChange={(e) => up("branch", e.target.value)}
        className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
      >
        <option value="">Todas las sucursales</option>
        {BRANCHES.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        value={filters.department}
        onChange={(e) => up("department", e.target.value)}
        className="h-8 px-3 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
      >
        <option value="">Todos los departamentos</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      {(filters.search ||
        filters.role ||
        filters.status ||
        filters.branch ||
        filters.department) && (
        <button
          onClick={() =>
            setFilters({
              search: "",
              role: "",
              status: "",
              branch: "",
              department: "",
            })
          }
          className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <X size={12} /> Limpiar
        </button>
      )}
      <button
        onClick={onCreateUser}
        className="h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm ml-auto"
      >
        <Plus size={13} /> Nuevo usuario
      </button>
    </div>
  );
};

// ─── User Table ───────────────────────────────────────────────────────────────

const UserTable = ({
  users,
  onEdit,
  onToggleActive,
  currentAdminId,
}: {
  users: UserRecord[];
  onEdit: (u: UserRecord) => void;
  onToggleActive: (u: UserRecord) => void;
  currentAdminId: string;
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
          <Users size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">Sin usuarios</p>
        <p className="text-xs text-slate-400 text-center max-w-xs">
          No se encontraron usuarios que coincidan con los filtros aplicados.
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
              "Usuario",
              "Código",
              "Rol",
              "Estado",
              "Sucursal",
              "Último acceso",
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
          {users.map((u, i) => {
            const isSelf = u.id === currentAdminId;
            return (
              <tr
                key={u.id}
                className={`border-b border-border hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar user={u} size="sm" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isActive ? "bg-green-500" : "bg-slate-300"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 flex items-center gap-1">
                        {u.fullName}
                        {isSelf && (
                          <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                            Tú
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                    {u.employeeCode}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RoleChip role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <UserStatusChip status={u.status} />
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {u.branchName}
                </td>
                <td className="px-4 py-3 text-slate-400 text-[10px] font-mono whitespace-nowrap">
                  {u.lastLogin}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(u)}
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                      title="Editar usuario"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => !isSelf && onToggleActive(u)}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "No puedes desactivarte a ti mismo"
                          : u.isActive
                            ? "Desactivar usuario"
                            : "Activar usuario"
                      }
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isSelf ? "opacity-30 cursor-not-allowed text-slate-300" : u.isActive ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "hover:bg-green-50 text-slate-400 hover:text-green-600"}`}
                    >
                      {u.isActive ? (
                        <UserX size={13} />
                      ) : (
                        <UserCheck size={13} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {users.length} usuarios encontrados
        </p>
        <div className="flex items-center gap-1">
          {["1", "2"].map((p) => (
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

// ─── User Edit/Create Modal ───────────────────────────────────────────────────

type ModalTab = "personal" | "work" | "account";

const UserModal = ({
  user,
  isCreate,
  currentAdminId,
  onClose,
  onSave,
  addToast,
}: {
  user: UserRecord | null;
  isCreate: boolean;
  currentAdminId: string;
  onClose: () => void;
  onSave: (u: UserRecord) => void;
  addToast: (m: string, t: "success" | "error") => void;
}) => {
  const blank: UserRecord = {
    id: `u${Date.now()}`,
    fullName: "",
    email: "",
    username: "",
    employeeCode: "",
    role: "employee",
    status: "ACTIVE",
    branchName: BRANCHES[0],
    department: DEPARTMENTS[0],
    position: "",
    phone: "",
    document: "",
    hireDate: "",
    lastLogin: "—",
    isActive: true,
    initials: "??",
    avatarColor: "#64748B",
  };
  const [form, setForm] = useState<UserRecord>(user ?? blank);
  const [tab, setTab] = useState<ModalTab>("personal");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isSelf = form.id === currentAdminId;

  const up = (k: keyof UserRecord, v: string | boolean) => {
    setForm((f) => ({
      ...f,
      [k]: v,
      initials:
        k === "fullName"
          ? (v as string)
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0] ?? "")
              .join("")
              .toUpperCase() || f.initials
          : f.initials,
    }));
  };

  const handleSave = () => {
    if (!form.fullName || !form.email) {
      addToast("Nombre y email son obligatorios", "error");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      addToast("Las contraseñas no coinciden", "error");
      return;
    }
    onSave(form);
    addToast(
      isCreate
        ? "Usuario creado exitosamente"
        : "Usuario actualizado exitosamente",
      "success",
    );
    onClose();
  };

  const handleSendQR = () => addToast(`QR enviado a ${form.email}`, "success");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileAttached(f.name);
      addToast(`Archivo "${f.name}" adjuntado`, "success");
    }
  };

  const tabs: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
    { id: "personal", label: "Datos personales", icon: <Users size={13} /> },
    { id: "work", label: "Datos laborales", icon: <Briefcase size={13} /> },
    {
      id: "account",
      label: "Cuenta y acceso",
      icon: <ShieldCheck size={13} />,
    },
  ];

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const Input = ({
    value,
    onChange,
    placeholder,
    type = "text",
    mono = false,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    mono?: boolean;
  }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all placeholder:text-slate-300 ${mono ? "font-mono" : ""}`}
    />
  );

  const Select = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden z-10 flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-4 bg-slate-50 flex-shrink-0">
          <Avatar user={form} size="md" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-800">
              {isCreate ? "Nuevo usuario" : form.fullName || "Editar usuario"}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {isCreate
                ? "Completa los datos para crear la cuenta"
                : form.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* QR Button */}
            {!isCreate && (
              <button
                onClick={handleSendQR}
                className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
              >
                <QrCode size={13} /> Enviar QR
              </button>
            )}
            {/* Attach file */}
            {!isCreate && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                >
                  <Paperclip size={13} />{" "}
                  {fileAttached ? "Cambiar" : "Adjuntar"}
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* File badge */}
        {fileAttached && (
          <div className="mx-6 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
            <Paperclip size={12} />
            <span className="font-medium truncate">{fileAttached}</span>
            <button
              onClick={() => setFileAttached(null)}
              className="ml-auto opacity-60 hover:opacity-100"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border px-6 flex-shrink-0 mt-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">
            {tab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Nombre completo">
                      <Input
                        value={form.fullName}
                        onChange={(v) => up("fullName", v)}
                        placeholder="Ej: Ana Martínez"
                      />
                    </Field>
                  </div>
                  <Field label="Correo electrónico">
                    <Input
                      value={form.email}
                      onChange={(v) => up("email", v)}
                      placeholder="correo@empresa.com"
                      type="email"
                    />
                  </Field>
                  <Field label="Teléfono">
                    <Input
                      value={form.phone}
                      onChange={(v) => up("phone", v)}
                      placeholder="+51 999 000 111"
                    />
                  </Field>
                  <Field label="Documento de identidad">
                    <Input
                      value={form.document}
                      onChange={(v) => up("document", v)}
                      placeholder="DNI 12345678"
                    />
                  </Field>
                </div>
              </motion.div>
            )}
            {tab === "work" && (
              <motion.div
                key="work"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Código de empleado">
                    <Input
                      value={form.employeeCode}
                      onChange={(v) => up("employeeCode", v)}
                      placeholder="EMP-000"
                      mono
                    />
                  </Field>
                  <Field label="Fecha de contratación">
                    <Input
                      value={form.hireDate}
                      onChange={(v) => up("hireDate", v)}
                      placeholder="dd/mm/aaaa"
                    />
                  </Field>
                  <Field label="Sucursal">
                    <Select
                      value={form.branchName}
                      onChange={(v) => up("branchName", v)}
                      options={BRANCHES.map((b) => ({ value: b, label: b }))}
                    />
                  </Field>
                  <Field label="Departamento">
                    <Select
                      value={form.department}
                      onChange={(v) => up("department", v)}
                      options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Cargo / Puesto">
                      <Input
                        value={form.position}
                        onChange={(v) => up("position", v)}
                        placeholder="Ej: Analista de Sistemas"
                      />
                    </Field>
                  </div>
                </div>
              </motion.div>
            )}
            {tab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre de usuario">
                    <Input
                      value={form.username}
                      onChange={(v) => up("username", v)}
                      placeholder="usuario.nombre"
                      mono
                    />
                  </Field>
                  <Field label="Rol">
                    <select
                      value={form.role}
                      onChange={(e) =>
                        !isSelf && up("role", e.target.value as UserRole)
                      }
                      disabled={isSelf}
                      title={
                        isSelf ? "No puedes cambiar tu propio rol" : undefined
                      }
                      className={`w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Empleado</option>
                    </select>
                    {isSelf && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> No puedes cambiar tu propio
                        rol
                      </p>
                    )}
                  </Field>
                  <Field label="Estado">
                    <Select
                      value={form.status}
                      onChange={(v) => up("status", v as UserStatus)}
                      options={[
                        { value: "ACTIVE", label: "Activo" },
                        { value: "INACTIVE", label: "Inactivo" },
                        { value: "VACATION", label: "Vacaciones" },
                        { value: "SUSPENDED", label: "Suspendido" },
                      ]}
                    />
                  </Field>
                  <Field label="Cuenta activa">
                    <div className="flex items-center gap-3 h-9">
                      <Toggle
                        checked={form.isActive}
                        onChange={(v) => !isSelf && up("isActive", v)}
                      />
                      <span
                        className={`text-xs font-medium ${form.isActive ? "text-green-600" : "text-slate-400"}`}
                      >
                        {form.isActive ? "Activo" : "Inactivo"}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                          <AlertTriangle size={10} /> No puedes desactivarte
                        </span>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Password change */}
                <div className="border-t border-border pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={14} className="text-slate-400" />
                    <p className="text-xs font-semibold text-slate-700">
                      {isCreate ? "Contraseña inicial" : "Cambiar contraseña"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={isCreate ? "Contraseña" : "Nueva contraseña"}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-9 px-3 pr-9 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </Field>
                    <Field label="Confirmar contraseña">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 px-3 rounded-lg border border-border bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
                      />
                    </Field>
                  </div>
                  {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <XCircle size={11} /> Las contraseñas no coinciden
                      </p>
                    )}
                  {newPassword &&
                    confirmPassword &&
                    newPassword === confirmPassword && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Las contraseñas coinciden
                      </p>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-2 h-2 rounded-full transition-colors ${tab === t.id ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-8 px-4 rounded-lg border border-border text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="h-8 px-5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Save size={13} />{" "}
              {isCreate ? "Crear usuario" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Users View ───────────────────────────────────────────────────────────────

export const UsersView = () => {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [filters, setFilters] = useState<UserFiltersState>({
    search: "",
    role: "",
    status: "",
    branch: "",
    department: "",
  });
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = users.filter((u) => {
    const q = filters.search.toLowerCase();
    if (
      q &&
      !u.fullName.toLowerCase().includes(q) &&
      !u.email.toLowerCase().includes(q) &&
      !u.employeeCode.toLowerCase().includes(q)
    )
      return false;
    if (filters.role && u.role !== filters.role) return false;
    if (filters.status && u.status !== filters.status) return false;
    if (filters.branch && u.branchName !== filters.branch) return false;
    if (filters.department && u.department !== filters.department) return false;
    return true;
  });

  const handleToggleActive = (u: UserRecord) => {
    if (u.id === CURRENT_ADMIN_ID) return;
    setUsers((prev) =>
      prev.map((x) =>
        x.id === u.id
          ? {
              ...x,
              isActive: !x.isActive,
              status: !x.isActive ? "ACTIVE" : "INACTIVE",
            }
          : x,
      ),
    );
  };

  const handleSaveUser = (updated: UserRecord) => {
    setUsers((prev) => {
      const exists = prev.find((x) => x.id === updated.id);
      return exists
        ? prev.map((x) => (x.id === updated.id ? updated : x))
        : [...prev, updated];
    });
  };

  // KPI counts
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const inactiveCount = users.filter(
    (u) => u.status === "INACTIVE" || u.status === "SUSPENDED",
  ).length;
  const vacationCount = users.filter((u) => u.status === "VACATION").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Usuarios activos"
          value={activeCount}
          delta={2}
          deltaLabel="este mes"
          icon={<UserCheck size={18} />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KPICard
          label="Inactivos / Suspendidos"
          value={inactiveCount}
          delta={0}
          deltaLabel="sin cambios"
          icon={<UserX size={18} />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <KPICard
          label="En vacaciones"
          value={vacationCount}
          delta={1}
          deltaLabel="esta semana"
          icon={<PauseCircle size={18} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Administradores"
          value={adminCount}
          delta={0}
          deltaLabel="sin cambios"
          icon={<ShieldCheck size={18} />}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Gestión de Usuarios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra cuentas, roles y permisos del sistema
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <RoleChip role="admin" />
          </span>
          <span className="flex items-center gap-1.5">
            <RoleChip role="manager" />
          </span>
          <span className="flex items-center gap-1.5">
            <RoleChip role="employee" />
          </span>
        </div>
      </div>

      {/* Filters */}
      <UserFilterBar
        filters={filters}
        setFilters={setFilters}
        onCreateUser={() => setIsCreating(true)}
      />

      {/* Table */}
      <UserTable
        users={filtered}
        onEdit={setEditingUser}
        onToggleActive={handleToggleActive}
        currentAdminId={CURRENT_ADMIN_ID}
      />

      {/* Modals */}
      <AnimatePresence>
        {(editingUser || isCreating) && (
          <UserModal
            key="user-modal"
            user={isCreating ? null : editingUser}
            isCreate={isCreating}
            currentAdminId={CURRENT_ADMIN_ID}
            onClose={() => {
              setEditingUser(null);
              setIsCreating(false);
            }}
            onSave={handleSaveUser}
            addToast={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
