import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "../services/attendance.service";
import type {
  AttendanceRecord,
  AttendanceHistoryQueryParams,
  AttendanceListResponse,
} from "../types/attendance.types";

interface UseAdvancedAttendanceReturn {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (
    filters: Partial<Omit<AttendanceHistoryQueryParams, "page" | "limit">>,
  ) => void;
}

export function useAttendanceRecords(
  initialFilters: Partial<
    Omit<AttendanceHistoryQueryParams, "page" | "limit">
  > = {},
  limit: number = 20,
): UseAdvancedAttendanceReturn {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] =
    useState<Partial<Omit<AttendanceHistoryQueryParams, "page" | "limit">>>(
      initialFilters,
    );
  const [hasMore, setHasMore] = useState(true);

  const fetchRecords = useCallback(
    async (newPage: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📋 [useAttendanceRecords] Cargando página", newPage, {
          filters,
          limit,
        });

        const params: AttendanceHistoryQueryParams = {
          page: newPage,
          limit,
          ...filters,
        };

        const response = await attendanceService.findAll(params);

        const {
          records: newRecords,
          total: totalRecords,
          totalPages: totalPagesCount,
        } = response;

        if (newPage === 1) {
          setRecords(newRecords);
        } else {
          setRecords((prev) => [...prev, ...newRecords]);
        }

        setTotal(totalRecords);
        setPage(newPage);
        setTotalPages(totalPagesCount);
        setHasMore(newPage < totalPagesCount);
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

  // Resetear y cargar primera página cuando cambian los filtros
  useEffect(() => {
    setRecords([]);
    setPage(1);
    setHasMore(true);
    void fetchRecords(1);
  }, [fetchRecords]);

  const refresh = useCallback(async () => {
    setRecords([]);
    setPage(1);
    setHasMore(true);
    await fetchRecords(1);
  }, [fetchRecords]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    await fetchRecords(nextPage);
  }, [hasMore, loading, page, fetchRecords]);

  const updateFilters = useCallback(
    (
      newFilters: Partial<Omit<AttendanceHistoryQueryParams, "page" | "limit">>,
    ) => {
      setFilters(newFilters);
    },
    [],
  );

  return {
    records,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    hasMore,
    refresh,
    loadMore,
    setFilters: updateFilters,
  };
}
