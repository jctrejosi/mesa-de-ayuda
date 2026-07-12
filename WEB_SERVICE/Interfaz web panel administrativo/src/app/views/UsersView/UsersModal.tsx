// ─── User Edit/Create Modal ───────────────────────────────────────────────────

import {
  AlertTriangle,
  XCircle,
  X,
  CheckCircle2,
  Save,
  Eye,
  ShieldCheck,
  QrCode,
  Paperclip,
  Lock,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toggle } from "./Toggle";
import { UserRecord } from "../../../types";

type ModalTab = "personal" | "work" | "account";

type UserStatus = "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
type UserRole = "admin" | "manager" | "employee";

interface UserModalProps {
  user: UserRecord | null;
  isCreate: boolean;
  currentAdminId: number;
  onClose: () => void;
  onSave: (u: UserRecord) => void;
  addToast: (m: string, t: "success" | "error") => void;
}

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

export const UserModal = ({
  user,
  isCreate,
  currentAdminId,
  onClose,
  onSave,
  addToast,
}: UserModalProps) => {
  // Función para obtener iniciales
  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase();
  };

  // Colores de avatar basados en el nombre
  const getAvatarColor = (name: string): string => {
    const colors = [
      "#2563EB",
      "#7C3AED",
      "#16A34A",
      "#DC2626",
      "#F59E0B",
      "#0891B2",
      "#BE185D",
      "#EA580C",
      "#0284C7",
      "#059669",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const blank: UserRecord = {
    id: 0,
    fullName: "",
    email: "",
    username: "",
    employeeCode: "",
    role: "employee",
    status: "ACTIVE",
    branchName: BRANCHES[0],
    departmentName: DEPARTMENTS[0],
    positionName: "",
    phone: "",
    documentNumber: "",
    hireDate: "",
    lastLogin: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // Avatar para el header
  const avatarInitials = getInitials(user?.fullName || "");
  const avatarColor = getAvatarColor(user?.fullName || "");

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
    {
      id: "personal",
      label: "Datos personales",
      icon: <UserCheck size={13} />,
    },
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
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarInitials || "?"}
          </div>
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
            {!isCreate && (
              <button
                onClick={handleSendQR}
                className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
              >
                <QrCode size={13} /> Enviar QR
              </button>
            )}
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
                      value={form.phone || ""}
                      onChange={(v) => up("phone", v)}
                      placeholder="+51 999 000 111"
                    />
                  </Field>
                  <Field label="Documento de identidad">
                    <Input
                      value={form.documentNumber || ""}
                      onChange={(v) => up("documentNumber", v)}
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
                      value={form.hireDate || ""}
                      onChange={(v) => up("hireDate", v)}
                      placeholder="dd/mm/aaaa"
                    />
                  </Field>
                  <Field label="Sucursal">
                    <Select
                      value={form.branchName || ""}
                      onChange={(v) => up("branchName", v)}
                      options={BRANCHES.map((b) => ({ value: b, label: b }))}
                    />
                  </Field>
                  <Field label="Departamento">
                    <Select
                      value={form.departmentName || ""}
                      onChange={(v) => up("departmentName", v)}
                      options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Cargo / Puesto">
                      <Input
                        value={form.positionName || ""}
                        onChange={(v) => up("positionName", v)}
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
