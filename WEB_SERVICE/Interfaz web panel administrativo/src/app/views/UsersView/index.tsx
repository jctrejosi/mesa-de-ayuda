import { useCallback, useEffect, useState } from "react";
import { UserCheck, UserX, PauseCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { RoleChip } from "./RoleChip";
import { KPICard } from "./KPICard";
import { UserFilterBar } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserModal } from "./UsersModal";
import { UserFilters, UserRecord } from "../../../types";
import { usersService } from "../../../services/users.service";

// ─── Users View ───────────────────────────────────────────────────────────────

export const UsersView = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: undefined,
    status: undefined,
    branchName: "",
    departmentName: "",
    positionName: "",
  });
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Estado de paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 10; // Items por página

  // Función para cargar usuarios (resetea la lista si cambian los filtros)
  const loadUsers = useCallback(
    async (resetPage = true) => {
      const currentPage = resetPage ? 1 : page;
      setLoading(resetPage);
      setLoadingMore(!resetPage);
      setError(null);

      try {
        const response = await usersService.list({
          ...filters,
          page: currentPage,
          limit,
        });

        if (resetPage) {
          setUsers(response.users);
        } else {
          setUsers((prev) => [...prev, ...response.users]);
        }

        setTotal(response.total);
        setTotalPages(response.totalPages);
        setPage(response.page);
      } catch (err: any) {
        setError(err.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, page, limit],
  );

  // Cargar cuando cambian los filtros
  useEffect(() => {
    loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadUsers(false);
    }
  };

  const handleToggleActive = (u: UserRecord) => {
    // Reemplazar con la lógica del backend cuando esté lista
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
        users={users}
        onEdit={setEditingUser}
        onToggleActive={handleToggleActive}
        currentAdminId={Number("")}
        onLoadMore={loadMore}
        hasMore={page < totalPages}
        loadingMore={loadingMore}
        loading={loading}
      />

      {/* Modals */}
      <AnimatePresence>
        {(editingUser || isCreating) && (
          <UserModal
            key="user-modal"
            user={isCreating ? null : editingUser}
            isCreate={isCreating}
            currentAdminId={Number("")}
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
