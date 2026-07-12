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
import {
  companyService,
  Branch,
  Department,
  Position,
} from "../../../services/company.service";

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  // Cargar listas de company
  useEffect(() => {
    const loadLists = async () => {
      try {
        const [branchesData, departmentsData, positionsData] =
          await Promise.all([
            companyService.getBranches(),
            companyService.getDepartments(),
            companyService.getPositions(),
          ]);
        setBranches(branchesData);
        setDepartments(departmentsData);
        setPositions(positionsData);
      } catch (err) {
        console.error("Error loading company lists:", err);
      } finally {
        setLoadingLists(false);
      }
    };
    loadLists();
  }, []);

  // Cargar usuarios
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

  useEffect(() => {
    loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadUsers(false);
    }
  };

  // En UsersView, agrega esto para manejar toasts
  const addToast = (message: string, type: "success" | "error") => {
    // TODO: Implementar con un sistema de notificaciones (react-hot-toast, sonner, etc.)
    console.log(`[${type}] ${message}`);
    // Si usas react-hot-toast:
    // if (type === 'success') toast.success(message);
    // else toast.error(message);
  };

  // ✅ Guardar usuario (crear o editar)
  const handleSaveUser = async (updated: UserRecord, password?: string) => {
    try {
      let savedUser: UserRecord;
      if (isCreating) {
        if (!password) {
          addToast(
            "La contraseña es obligatoria para nuevos usuarios",
            "error",
          );
          return;
        }
        savedUser = await usersService.create({
          ...updated,
          password,
        });
        // ✅ Actualizar la lista después de crear
        await loadUsers(true);
      } else {
        savedUser = await usersService.update(updated.id, updated);
        setUsers((prev) =>
          prev.map((u) => (u.id === savedUser.id ? savedUser : u)),
        );
      }

      // Cerrar modal
      setEditingUser(null);
      setIsCreating(false);
      addToast(
        isCreating
          ? "Usuario creado exitosamente"
          : "Usuario actualizado exitosamente",
        "success",
      );
    } catch (err: any) {
      console.error("Error saving user:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al guardar el usuario";
      addToast(message, "error");
    }
  };

  const handleToggleActive = async (u: UserRecord) => {
    try {
      const result = await usersService.toggleStatus(u.id);
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? {
                ...x,
                isActive: result.active,
                status: result.active ? "ACTIVE" : "INACTIVE",
              }
            : x,
        ),
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

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
        currentAdminId={0} // reemplazar con el ID del admin logueado
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
            currentAdminId={0}
            branches={branches}
            departments={departments}
            positions={positions}
            onClose={() => {
              setEditingUser(null);
            }}
            onSave={handleSaveUser}
            addToast={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
