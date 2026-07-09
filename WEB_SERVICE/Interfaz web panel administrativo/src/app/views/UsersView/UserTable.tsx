import { Edit3, UserCheck, Users, UserX } from "lucide-react";
import { Avatar } from "./Avatar";
import { RoleChip } from "./RoleChip";
import { UserStatusChip } from "./UserStatusChip";

// ─── User Table ───────────────────────────────────────────────────────────────
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

interface UserTableProps {
  users: UserRecord[];
  onEdit: (u: UserRecord) => void;
  onToggleActive: (u: UserRecord) => void;
  currentAdminId: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const UserTable = ({
  users,
  onEdit,
  onToggleActive,
  currentAdminId,
  onLoadMore,
  hasMore = false,
}: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border h-full flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
          <Users size={26} className="text-slate-300" />
        </div>

        <p className="text-sm font-semibold text-slate-600">Sin usuarios</p>

        <p className="text-xs text-slate-400 text-center max-w-xs">
          No se encontraron usuarios que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">Usuarios</h3>

        <span className="text-xs text-slate-500">
          {users.length} encontrados
        </span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {users.map((u) => {
          const isSelf = u.id === currentAdminId;

          return (
            <div
              key={u.id}
              onClick={() => onEdit(u)}
              className="px-6 py-4 hover:bg-blue-50/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4 w-full">
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar user={u} size="md" />

                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      u.isActive ? "bg-green-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                {/* Información */}
                <div className="flex-1 overflow-hidden space-y-2">
                  {/* Nombre + Chips */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {u.fullName}
                    </p>

                    {isSelf && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Tú
                      </span>
                    )}

                    <RoleChip role={u.role} />
                    <UserStatusChip status={u.status} />
                  </div>

                  {/* Datos secundarios */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {u.employeeCode}
                    </span>

                    <span className="truncate max-w-[260px]">{u.email}</span>

                    <span>{u.branchName || "Sin sucursal"}</span>

                    {u.lastLogin && <span>Último acceso: {u.lastLogin}</span>}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(u);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Editar usuario"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelf) onToggleActive(u);
                    }}
                    disabled={isSelf}
                    title={
                      isSelf
                        ? "No puedes desactivarte a ti mismo"
                        : u.isActive
                          ? "Desactivar usuario"
                          : "Activar usuario"
                    }
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelf
                        ? "opacity-30 cursor-not-allowed text-slate-300"
                        : u.isActive
                          ? "text-slate-400 hover:text-red-600 hover:bg-red-100"
                          : "text-slate-400 hover:text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ver más */}
      {hasMore && onLoadMore && (
        <div className="px-6 py-4 border-t border-border bg-slate-50">
          <button
            onClick={onLoadMore}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Ver más usuarios
          </button>
        </div>
      )}
    </div>
  );
};
