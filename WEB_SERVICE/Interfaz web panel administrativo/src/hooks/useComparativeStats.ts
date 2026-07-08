import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "../services/attendance.service";
import type { ComparativeStats } from "../types/attendance.types";

interface UseComparativeStatsReturn {
  stats: ComparativeStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useComparativeStats(): UseComparativeStatsReturn {
  const [stats, setStats] = useState<ComparativeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("📊 [useComparativeStats] Cargando estadísticas...");
      const data = await attendanceService.getStats();
      setStats(data);
      console.log("📊 [useComparativeStats] Estadísticas cargadas:", data);
    } catch (err: any) {
      console.error("❌ [useComparativeStats] Error:", err);
      setError(err.message || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
