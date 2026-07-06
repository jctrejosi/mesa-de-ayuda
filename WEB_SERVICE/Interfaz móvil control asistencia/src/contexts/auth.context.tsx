import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/login.service";

interface User {
  id: number;
  username: string;
  employeeId: number;
  fullName: string;
  email?: string | null;
  role: "admin" | "manager" | "employee";
  employeeCode: string;
  area: string;
  branch: {
    id: number;
    name: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;
  department: {
    id: number;
    name: string;
  } | null;
  position: {
    id: number;
    name: string;
  } | null;
  photo?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const response = await api.get("/auth/me");
          const data = response.data.data || response.data;
          setUser(data);
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

  const login = async (credentials: {
    username: string;
    password: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data.data || response.data;

      console.log("📥 Login response:", data);

      const userData: User = {
        id: data.user.id,
        username: data.user.username,
        employeeId: data.user.employeeId,
        fullName: data.user.fullName,
        email: data.user.email || null,
        role: data.user.role || "employee",
        employeeCode:
          data.user.employeeCode ||
          `EMP-${String(data.user.employeeId).padStart(4, "0")}`,
        area: data.user.area || "Sin área asignada",
        branch: data.user.branch || null,
        department: data.user.department || null,
        position: data.user.position || null,
        photo: data.user.photo || null,
      };

      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

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

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout");
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
