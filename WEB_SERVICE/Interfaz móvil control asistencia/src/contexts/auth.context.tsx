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

  // Verificar sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          // ✅ La cookie se envía automáticamente con withCredentials
          const profile = await authService.getProfile();
          setUser(profile);
          // Actualizar localStorage con datos frescos
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (err) {
          console.error("❌ Error al obtener perfil:", err);
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);

      console.log("📥 Login response:", response);

      // El token está en la cookie, solo guardamos el user
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      // Redirigir si es admin
      if (response.user.role === "admin") {
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

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn("⚠️ Error en logout:", err);
    } finally {
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
