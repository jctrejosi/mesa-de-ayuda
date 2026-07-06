import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { authService, LoginCredentials, LoginResponse } from "../services/api";

interface User {
  id: number;
  username: string;
  employeeId: number;
  fullName: string;
  email?: string | null;
  role?: "admin" | "manager" | "employee";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean; // 👈 Añadir helper
  isEmployee: boolean; // 👈 Añadir helper
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

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setIsLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
      }

      setUser(null);
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

      const userData = {
        ...response.user,
        role: response.user.role || "employee",
      };

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      // 👈 REDIRIGIR INMEDIATAMENTE DESPUÉS DEL LOGIN
      if (userData.role === "admin") {
        console.log("🚀 Admin detectado, redirigiendo a http://localhost:5174");
        window.location.href = "http://localhost:5174";
      }
      // Si es employee, la redirección la maneja AppContent
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
      // Ignorar errores en logout
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // 👈 Helpers para verificar roles
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
