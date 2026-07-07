import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogIn,
  LogOut,
  Info,
  User,
  History,
  Home,
  X,
  Signal,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Building2,
  LayoutGrid,
  ChevronDown,
  Star,
} from "lucide-react";
import { AuthProvider, useAuth } from "../contexts/auth.context";
import { useAttendance } from "../hook/useAttendance";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppView = "login" | "attendance";
type AppScreen = "loading" | "valid" | "invalid" | "confirmed";
type AttendanceType = "entrada" | "salida";
type GpsPrecision = "excellent" | "good" | "low";
type NavTab = "asistencia" | "historial" | "perfil";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

interface LoginFormErrors {
  email?: string;
  password?: string;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [msLoading, setMsLoading] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();

  // Limpiar error cuando el usuario cambia los campos
  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  const validate = () => {
    const e: LoginFormErrors = {};
    if (!email.trim()) e.email = "El usuario o correo es obligatorio.";
    else if (email.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Ingresa un correo electrónico válido.";
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 4)
      e.password = "La contraseña debe tener al menos 4 caracteres.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await login({ username: email, password });
      // ❌ Elimina esta línea si existe
      // onSuccess();
      // ✅ La redirección se maneja en AppContent
    } catch (err) {
      // El error ya se maneja en el contexto
    }
  };

  const handleMs = async () => {
    setMsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setMsLoading(false);
    // Aquí iría la lógica de Microsoft SSO
    // Por ahora simulamos un login exitoso con credenciales fijas
    try {
      await login({
        username: "demo@empresa.com",
        password: "demo1234",
      });
    } catch (err) {
      // Manejar error
    }
  };

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* --- Left panel --- */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #1E3A8A 0%, #2563EB 45%, #3B82F6 75%, #60A5FA 100%)",
        }}
      >
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=900&h=1200&fit=crop&auto=format&q=70"
            alt="Equipo corporativo colaborando"
            className="w-full h-full object-cover opacity-[0.12]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(30,58,138,0.95) 0%, rgba(37,99,235,0.85) 50%, rgba(59,130,246,0.80) 100%)",
            }}
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute top-1/3 -right-10 w-48 h-48 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[12px] bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <LayoutGrid size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">
                NexusERP
              </p>
              <p className="text-blue-200 text-[11px] font-medium mt-0.5">
                Enterprise Suite
              </p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Module pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["Finanzas", "RRHH", "Logística", "CRM", "Reportes"].map((m) => (
                <span
                  key={m}
                  className="text-[11px] font-semibold text-blue-100 bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm"
                >
                  {m}
                </span>
              ))}
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Gestiona tu empresa
              <br />
              <span className="text-blue-200">desde un solo lugar.</span>
            </h2>

            <p className="text-blue-100 text-[15px] leading-relaxed max-w-xs">
              Plataforma integral para la gestión empresarial. Conecta tus
              equipos, optimiza tus procesos y toma mejores decisiones.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "98%", label: "Uptime" },
                { value: "12k+", label: "Usuarios" },
                { value: "ISO 27001", label: "Seguridad" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 border border-white/20 rounded-[14px] p-3 backdrop-blur-sm text-center"
                >
                  <p className="text-white font-bold text-lg">{s.value}</p>
                  <p className="text-blue-200 text-[11px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-6 bg-white/10 border border-white/20 rounded-[16px] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className="text-yellow-300 fill-yellow-300"
                  />
                ))}
              </div>
              <p className="text-blue-50 text-[13px] leading-relaxed italic">
                "NexusERP transformó completamente la forma en que gestionamos
                nuestras operaciones."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold">
                  MR
                </div>
                <div>
                  <p className="text-white text-[12px] font-semibold">
                    María Rodríguez
                  </p>
                  <p className="text-blue-200 text-[10px]">
                    CTO · Grupo Empresarial Norte
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right panel --- */}
      <div className="flex-1 bg-[#F5F7FA] flex flex-col">
        {/* Top bar for mobile branding */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 pt-8 pb-2">
          <div className="w-9 h-9 rounded-[10px] bg-[#2563EB] flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" strokeWidth={1.8} />
          </div>
          <span className="font-bold text-[#0F1523] text-base">NexusERP</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px]">
            {/* Card */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgba(15,23,42,0.10)] p-8 lg:p-10">
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-[14px] bg-[#EFF3FF] flex items-center justify-center mb-5">
                  <Lock size={22} className="text-[#2563EB]" />
                </div>
                <h1 className="text-[26px] font-bold text-[#0F1523] mb-1.5">
                  Iniciar sesión
                </h1>
                <p className="text-[#64748B] text-sm">
                  Accede con tu cuenta corporativa.
                </p>
              </div>

              {/* Error global */}
              {error && (
                <div className="mb-4 p-3 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5">
                  <AlertTriangle
                    size={16}
                    className="text-[#DC2626] shrink-0 mt-0.5"
                  />
                  <p className="text-[13px] text-[#B91C1C] font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Microsoft SSO */}
              <button
                onClick={handleMs}
                disabled={msLoading || isLoading}
                className="w-full h-11 rounded-[12px] border-2 border-[#E2E8F0] bg-white flex items-center justify-center gap-3 text-[#374151] text-[14px] font-semibold hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all disabled:opacity-50 mb-6"
              >
                {msLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#64748B]" />
                ) : (
                  <MicrosoftIcon />
                )}
                {msLoading ? "Redirigiendo…" : "Iniciar con Microsoft"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-[12px] text-[#94A3B8] font-medium">
                  o continúa con
                </span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Usuario o correo electrónico
                  </label>
                  <div
                    className={`relative flex items-center rounded-[12px] border-2 bg-[#F8FAFC] transition-all ${
                      errors.email
                        ? "border-[#EF4444] bg-[#FFF5F5]"
                        : "border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white"
                    }`}
                  >
                    <Mail
                      size={16}
                      className="absolute left-3.5 text-[#94A3B8]"
                    />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((p) => ({ ...p, email: undefined }));
                        clearError();
                      }}
                      placeholder="usuario@empresa.com"
                      className="w-full bg-transparent pl-10 pr-4 py-3 text-[14px] text-[#0F1523] placeholder:text-[#CBD5E1] outline-none"
                      autoComplete="username"
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[#EF4444] font-medium">
                      <AlertTriangle size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-semibold text-[#374151]">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="text-[12px] text-[#2563EB] font-semibold hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div
                    className={`relative flex items-center rounded-[12px] border-2 bg-[#F8FAFC] transition-all ${
                      errors.password
                        ? "border-[#EF4444] bg-[#FFF5F5]"
                        : "border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:bg-white"
                    }`}
                  >
                    <Lock
                      size={16}
                      className="absolute left-3.5 text-[#94A3B8]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: undefined }));
                        clearError();
                      }}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-10 pr-11 py-3 text-[14px] text-[#0F1523] placeholder:text-[#CBD5E1] outline-none"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[#EF4444] font-medium">
                      <AlertTriangle size={12} />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setRemember((p) => !p)}
                    className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all ${
                      remember
                        ? "bg-[#2563EB] border-[#2563EB]"
                        : "border-[#CBD5E1] group-hover:border-[#93C5FD]"
                    }`}
                  >
                    {remember && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] text-[#374151] font-medium select-none">
                    Recordar sesión
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || msLoading}
                  className="w-full h-[50px] mt-2 rounded-[14px] bg-[#2563EB] text-white font-semibold text-[15px] flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verificando…
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <LogIn size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-1.5">
              <p className="text-[12px] text-[#94A3B8]">
                NexusERP v4.2.1 · Desarrollado por{" "}
                <span className="font-semibold text-[#64748B]">
                  Nexus Technologies S.A.S.
                </span>
              </p>
              <p className="text-[12px] text-[#94A3B8]">
                <button className="hover:text-[#2563EB] transition-colors">
                  Política de privacidad
                </button>
                {" · "}
                <button className="hover:text-[#2563EB] transition-colors">
                  Términos de uso
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-4">
      <div>
        <p className="text-xs font-medium text-[#64748B] tracking-widest uppercase">
          Mesa de Ayuda
        </p>
        <h1 className="text-lg font-semibold text-[#0F1523]">
          Control de Asistencia
        </h1>
      </div>
      <button
        onClick={onLogout}
        className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/[0.06] flex items-center justify-center text-[#475569] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
        title="Cerrar sesión"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

function EmployeeCard({ employee }: { employee: any }) {
  const EMPLOYEE = employee;
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] p-4 flex items-center gap-4">
      <div className="relative shrink-0">
        <img
          src={EMPLOYEE.avatar}
          alt={EMPLOYEE.name}
          className="w-[60px] h-[60px] rounded-full object-cover bg-[#E8ECF2]"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[#0F1523] text-[15px] truncate">
          {EMPLOYEE.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#64748B] font-medium">
            {EMPLOYEE.code}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
          <span className="text-xs text-[#64748B] truncate">
            {EMPLOYEE.role}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-[#EFF3FF] text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <MapPin size={10} />
            {EMPLOYEE.area}
          </span>
        </div>
      </div>
    </div>
  );
}

function GpsPrecisionBadge({ precision }: { precision: GpsPrecision | null }) {
  const map = {
    excellent: {
      label: "GPS Excelente",
      color: "text-[#16A34A]",
      bg: "bg-[#F0FDF4]",
    },
    good: { label: "GPS Bueno", color: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
    low: { label: "GPS Bajo", color: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
  };
  const p = precision ? map[precision] : null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${p?.bg || "bg-[#F0FDF4]"} ${p?.color || "text-[#16A34A]"}`}
    >
      <Signal size={10} />
      {p?.label}
    </span>
  );
}

function LocationCard({
  screen,
  precision,
}: {
  screen: AppScreen;
  precision: GpsPrecision | null;
}) {
  const isLoading = screen === "loading";
  const isValid = screen === "valid" || screen === "confirmed";
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] p-5">
      {isLoading ? (
        <div className="flex flex-col items-center py-3 gap-3">
          <div className="w-14 h-14 rounded-full bg-[#EFF3FF] flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-[3px] border-[#2563EB] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0F1523] text-[15px]">
              Obteniendo ubicación…
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verificando señal GPS
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 shrink-0 rounded-[16px] flex items-center justify-center ${isValid ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]"}`}
          >
            <MapPin
              size={26}
              className={isValid ? "text-[#16A34A]" : "text-[#DC2626]"}
              strokeWidth={2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`font-semibold text-[15px] ${isValid ? "text-[#15803D]" : "text-[#B91C1C]"}`}
              >
                {isValid ? "Ubicación verificada" : "Fuera del área"}
              </p>
              {isValid ? (
                <CheckCircle2 size={16} className="text-[#16A34A]" />
              ) : (
                <AlertTriangle size={16} className="text-[#DC2626]" />
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              {isValid
                ? "Te encuentras dentro del área autorizada."
                : "Acércate a tu lugar de trabajo para registrar la asistencia."}
            </p>
            <div className="mt-2.5">
              <GpsPrecisionBadge precision={precision} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockCard({ now }: { now: Date }) {
  const [h, m, s] = formatTime(now).split(":");
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-[#64748B]" />
        <span className="text-xs font-medium text-[#64748B] capitalize">
          {formatDate(now)}
        </span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-[44px] font-bold text-[#0F1523] leading-none tracking-tight tabular-nums">
          {h}:{m}
        </span>
        <span className="text-2xl font-semibold text-[#94A3B8] leading-none mb-1 tabular-nums">
          :{s}
        </span>
      </div>
    </div>
  );
}

function MainButton({
  screen,
  attendanceType,
  onPress,
}: {
  screen: AppScreen;
  attendanceType: AttendanceType;
  onPress: () => void;
}) {
  const enabled = screen === "valid";
  const isEntrada = attendanceType === "entrada";
  return (
    <div className="mx-4">
      <button
        onClick={enabled ? onPress : undefined}
        disabled={!enabled}
        className={`w-full h-[60px] rounded-[18px] flex items-center justify-center gap-3 font-semibold text-[16px] transition-all duration-200 ${
          enabled
            ? "bg-[#2563EB] text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] active:scale-[0.98] hover:bg-[#1D4ED8]"
            : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
        }`}
      >
        {enabled ? (
          <>
            {isEntrada ? (
              <LogIn size={20} strokeWidth={2} />
            ) : (
              <LogOut size={20} strokeWidth={2} />
            )}
            {isEntrada ? "Registrar Entrada" : "Registrar Salida"}
          </>
        ) : screen === "loading" ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-[#94A3B8] border-t-transparent animate-spin" />
            Obteniendo ubicación…
          </>
        ) : (
          <>
            <MapPin size={20} />
            No disponible
          </>
        )}
      </button>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="mx-4 bg-[#EFF3FF] rounded-[16px] p-4 flex items-start gap-3">
      <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
      <p className="text-xs text-[#3B5EA6] leading-relaxed">
        El registro únicamente puede realizarse dentro del área autorizada. La
        ubicación se verifica automáticamente.
      </p>
    </div>
  );
}

function BottomNav({
  active,
  onSelect,
}: {
  active: NavTab;
  onSelect: (t: NavTab) => void;
}) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "asistencia",
      label: "Asistencia",
      icon: <Home size={22} strokeWidth={1.8} />,
    },
    {
      id: "historial",
      label: "Historial",
      icon: <History size={22} strokeWidth={1.8} />,
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: <User size={22} strokeWidth={1.8} />,
    },
  ];
  return (
    <div className="bg-white border-t border-black/[0.06] flex pb-8 pt-2 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${active === tab.id ? "text-[#2563EB]" : "text-[#94A3B8]"}`}
        >
          {tab.icon}
          <span className="text-[10px] font-semibold tracking-wide">
            {tab.label}
          </span>
          {active === tab.id && (
            <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
          )}
        </button>
      ))}
    </div>
  );
}

function ConfirmationModal({
  type,
  time,
  onClose,
  code,
}: {
  type: AttendanceType;
  time: string;
  onClose: () => void;
  code: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[28px] p-6 pb-10 animate-[slideUp_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"
        >
          <X size={16} />
        </button>
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4 shadow-[0_0_0_8px_#DCFCE7]">
            <CheckCircle2
              size={40}
              className="text-[#16A34A]"
              strokeWidth={1.8}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#15803D] text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <CheckCircle2 size={12} />
            Registro exitoso
          </span>
          <h2 className="text-xl font-bold text-[#0F1523]">
            {type === "entrada" ? "Entrada registrada" : "Salida registrada"}
          </h2>
          <p className="text-[#64748B] text-sm mt-1">
            Tu asistencia ha sido confirmada
          </p>
          <div className="w-full mt-6 bg-[#F8FAFC] rounded-[16px] p-4 space-y-3">
            {[
              {
                icon: <Clock size={15} />,
                label: "Hora registrada",
                value: time,
              },
              {
                icon:
                  type === "entrada" ? (
                    <LogIn size={15} />
                  ) : (
                    <LogOut size={15} />
                  ),
                label: "Tipo de registro",
                value: type === "entrada" ? "Entrada" : "Salida",
              },
              {
                icon: <MapPin size={15} />,
                label: "Ubicación",
                value: "Área autorizada ✓",
                color: "text-[#16A34A]",
              },
              {
                icon: <Shield size={15} />,
                label: "Empleado",
                value: code,
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748B]">
                  {icon}
                  <span className="text-xs">{label}</span>
                </div>
                <span
                  className={`text-xs font-semibold ${color ?? "text-[#0F1523]"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full mt-5 h-[52px] rounded-[16px] bg-[#2563EB] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:bg-[#1D4ED8] transition-colors"
          >
            Continuar
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenSelector({
  current,
  onChange,
}: {
  current: AppScreen;
  onChange: (s: AppScreen) => void;
}) {
  const options: { id: AppScreen; label: string }[] = [
    { id: "loading", label: "Cargando" },
    { id: "valid", label: "Válido" },
    { id: "invalid", label: "No válido" },
    { id: "confirmed", label: "Confirmado" },
  ];
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-black/[0.08] rounded-full px-1.5 py-1 shadow-sm mx-auto w-fit">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${current === o.id ? "bg-[#2563EB] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F1523]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AttendanceScreen() {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [navTab, setNavTab] = useState<NavTab>("asistencia");
  const [now, setNow] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState("");
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>("entrada");
  const { user } = useAuth();

  const { logout } = useAuth();

  const {
    status, // ← Solo de validateLocation
    validation, // ← Respuesta de validateLocation
    precision, // ← Precisión GPS
    isLoading, // ← Mientras valida
    isRegistering, // ← Mientras registra
    registerAttendance,
    retry,
  } = useAttendance();

  const employeeData = {
    name: user?.fullName || user?.username || "Usuario",
    code: user?.employeeId
      ? `EMP-${String(user.employeeId).padStart(4, "0")}`
      : "EMP-0000",
    role:
      user?.role === "admin"
        ? "Administrador"
        : user?.role === "manager"
          ? "Gerente"
          : "Agente de Mesa de Ayuda",
    area: user?.area || "", // Podrías obtener esto del backend también
    avatar:
      user?.photo ||
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format&q=80",
  };

  useEffect(() => {
    if (screen === "loading") {
      const t = setTimeout(() => setScreen("valid"), 2200);
      return () => clearTimeout(t);
    }
  }, [screen]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRegister = useCallback(() => {
    setConfirmedTime(formatTime(now));
    setShowModal(true);
  }, [now]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setAttendanceType((p) => (p === "entrada" ? "salida" : "entrada"));
  }, []);

  return (
    <div className="relative w-full max-w-[430px] min-h-screen flex flex-col bg-[#F5F7FA] overflow-hidden">
      <TopBar
        onLogout={() => {
          logout();
          // El contexto manejará la redirección
        }}
      />
      <div className="px-4 py-2">
        <ScreenSelector current={screen} onChange={setScreen} />
      </div>
      <div
        className="flex-1 overflow-y-auto overscroll-contain space-y-3 pb-4 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        <EmployeeCard employee={employeeData} />
        <LocationCard screen={screen} precision={precision} />
        <ClockCard now={now} />
        <MainButton
          screen={screen}
          attendanceType={attendanceType}
          onPress={handleRegister}
        />
        <InfoCard />
        {screen !== "loading" && (
          <div className="mx-4 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                screen === "valid" || screen === "confirmed"
                  ? "bg-[#DCFCE7] text-[#15803D]"
                  : "bg-[#FEE2E2] text-[#B91C1C]"
              }`}
            >
              {screen === "valid" || screen === "confirmed" ? (
                <CheckCircle2 size={11} />
              ) : (
                <AlertTriangle size={11} />
              )}
              {screen === "valid" || screen === "confirmed"
                ? "Área permitida"
                : "Fuera del área"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#EFF3FF] text-[#2563EB]">
              <User size={11} />
              Sesión activa
            </span>
          </div>
        )}
      </div>
      <BottomNav active={navTab} onSelect={setNavTab} />
      {showModal && (
        <ConfirmationModal
          code={employeeData.code}
          type={attendanceType}
          time={confirmedTime}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

const AppContent = () => {
  const { isAuthenticated, isLoading, user, isAdmin, isEmployee, logout } =
    useAuth();

  console.log("🔍 AppContent State:", {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    isEmployee,
    role: user?.role,
  });

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[#2563EB] animate-spin" />
          <p className="text-[#64748B] font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <LoginScreen />
      </div>
    );
  }

  // Si es admin, mostrar pantalla de carga (ya redirigió desde el login)
  // Pero por si acaso, también redirigimos aquí
  if (isAdmin) {
    // Redirigir si por alguna razón no se hizo en el login
    console.log("🚀 Redirigiendo a administración desde AppContent...");
    window.location.href = "http://localhost:5174";
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[#2563EB] animate-spin" />
          <p className="text-[#64748B] font-medium">
            Redirigiendo al panel de administración...
          </p>
        </div>
      </div>
    );
  }

  // Empleado o manager → AttendanceScreen
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="min-h-screen bg-[#F5F7FA] flex items-start justify-center">
        <AttendanceScreen />
      </div>
    </div>
  );
};
// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
