import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "../services/attendance.service";
import type {
  AttendanceListResponse,
  AttendanceWithRelations,
} from "../types/attendance.types";

interface UseAttendanceRecordsReturn {
  records: AttendanceWithRelations[];
  loading: boolean;
  error: string | null;
  total: number;
  limit: number;
  offset: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: any) => void;
}

interface Filters {
  startDate?: string;
  endDate?: string;
  type?: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  employeeId?: number;
  branchId?: number;
  search?: string;
}

type AttendanceQueryParams = {
  startDate?: string;
  endDate?: string;
  type?: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  employeeId?: number;
  branchId?: number;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "checkType" | "distance";
  orderDirection?: "ASC" | "DESC";
};

export function useAttendanceRecords(
  initialFilters: Filters = {},
  limit: number = 20,
): UseAttendanceRecordsReturn {
  const [records, setRecords] = useState<AttendanceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecords = useCallback(
    async (newOffset: number = 0) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📋 [useAttendanceRecords] Cargando registros...", {
          filters,
          limit,
          offset: newOffset,
        });

        const params: AttendanceQueryParams = {
          ...filters,
          limit,
          offset: newOffset,
          orderBy: "createdAt",
          orderDirection: "DESC",
        };

        let response: AttendanceListResponse;

        if (filters.employeeId) {
          response = await attendanceService.getEmployeeHistory(
            filters.employeeId,
            params as Parameters<
              typeof attendanceService.getEmployeeHistory
            >[1],
          );
        } else {
          response = await attendanceService.findAll(
            params as Parameters<typeof attendanceService.findAll>[0],
          );
        }

        const {
          records: newRecords,
          total: totalRecords,
          offset: currentOffset,
        } = response;

        if (newOffset === 0) {
          setRecords(newRecords);
        } else {
          setRecords((prev) => [...prev, ...newRecords]);
        }

        setTotal(totalRecords);
        setOffset(currentOffset);
        const hasMoreRecords = newOffset + newRecords.length < totalRecords;
        setHasMore(hasMoreRecords);

        console.log("📋 [useAttendanceRecords] Registros cargados:", {
          count: newRecords.length,
          total: totalRecords,
          hasMore: hasMoreRecords,
        });
      } catch (err: unknown) {
        console.error("❌ [useAttendanceRecords] Error:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar registros",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, limit],
  );

  useEffect(() => {
    setRecords([]);
    setOffset(0);
    setHasMore(true);
    void fetchRecords(0);
  }, [fetchRecords]);

  const refresh = useCallback(async () => {
    setRecords([]);
    setOffset(0);
    setHasMore(true);
    await fetchRecords(0);
  }, [fetchRecords]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextOffset = offset + limit;
    await fetchRecords(nextOffset);
  }, [hasMore, loading, offset, limit, fetchRecords]);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    records,
    loading,
    error,
    total,
    limit,
    offset,
    refresh,
    loadMore,
    setFilters: updateFilters,
  };
}
