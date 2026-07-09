// ─── User Filter Bar ──────────────────────────────────────────────────────────

import { Plus, Search, X } from "lucide-react";

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

interface UserFiltersState {
  search: string;
  role: string;
  status: string;
  branch: string;
  department: string;
}

export const UserFilterBar = ({
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
