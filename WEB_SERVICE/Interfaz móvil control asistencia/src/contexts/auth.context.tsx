import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { authService, User, LoginCredentials } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Verificar sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // ✅ Usar authService.getProfile() correctamente
          const profile = await authService.getProfile();
          setUser(profile);
          setIsLoading(false);
          return;
        } catch (err) {
          console.error("❌ Error al obtener perfil:", err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
      }

      setUser(null);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // ✅ Login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Usar authService.login()
      const response = await authService.login(credentials);

      console.log("📥 Login response:", response);

      // El user ya viene en el formato correcto de authService
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        employeeId: response.user.employeeId,
        fullName: response.user.fullName,
        email: response.user.email || null,
        role: response.user.role || "employee",
        employeeCode:
          response.user.employeeCode ||
          `EMP-${String(response.user.employeeId).padStart(4, "0")}`,
        area: response.user.area || "Sin área asignada",
        branch: response.user.branch || null,
        department: response.user.department || null,
        position: response.user.position || null,
        photo: response.user.photo || null,
      };

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("✅ Token guardado:", localStorage.getItem("access_token"));
      console.log(
        "✅ Token length:",
        localStorage.getItem("access_token")?.length,
      );

      setUser(userData);

      // Redirigir si es admin
      if (userData.role === "admin") {
        console.log("🚀 Admin detectado, redirigiendo a http://localhost:5174");
        window.location.href = "http://localhost:5174";
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al iniciar sesión. Intenta nuevamente.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // ✅ Usar authService.logout()
      await authService.logout();
    } catch (err) {
      console.warn("⚠️ Error en logout:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isEmployee,
    login,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
