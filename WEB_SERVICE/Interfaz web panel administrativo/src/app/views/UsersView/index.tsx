import { useState } from "react";
import { UserCheck, UserX, PauseCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { RoleChip } from "./RoleChip";
import { KPICard } from "./KPICard";
import { UserFilterBar } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserModal } from "./UsersModal";

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
