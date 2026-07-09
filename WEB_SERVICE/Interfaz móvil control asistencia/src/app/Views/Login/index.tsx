// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth.context";
import logo from "../../../assets/logo.png";
import {
  AlertTriangle,
  LogIn,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  LayoutGrid,
  Star,
} from "lucide-react";

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function LoginScreen() {
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
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src={logo}
                alt="DSI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">
                DSI ERP
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
                "DSI S.A. transformó completamente la forma en que gestionamos
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
          <span className="font-bold text-[#0F1523] text-base">DSI ERP</span>
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

              {/* Microsoft SSO
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
              */}

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
                DSI ERP v4.2.1 · Desarrollado por{" "}
                <span className="font-semibold text-[#64748B]">DSI S.A.</span>
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
