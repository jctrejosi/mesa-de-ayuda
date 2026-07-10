// src/hook/useInventory.ts
import { useState, useEffect, useCallback } from "react";
import {
  InventoryService,
  InventoryItem,
  ListInventoryDto,
  PaginatedInventoryResponse,
} from "../services/inventory.service";

interface UseInventoryReturn {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchItems: (params?: ListInventoryDto) => Promise<void>;
  loadMore: () => Promise<void>;
  searchItems: (term: string) => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

export function useInventory(
  initialParams: ListInventoryDto = {},
): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialParams.limit || 20,
    total: 0,
    totalPages: 0,
  });
  const [currentParams, setCurrentParams] = useState<ListInventoryDto>({
    ...initialParams,
    page: 1,
  });

  const fetchItems = useCallback(
    async (params: ListInventoryDto = {}) => {
      setLoading(true);
      setError(null);
      try {
        const mergedParams = {
          ...currentParams,
          ...params,
        };
        setCurrentParams(mergedParams);

        const response = await InventoryService.list(mergedParams);

        setItems(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Error al cargar el inventario");
      } finally {
        setLoading(false);
      }
    },
    [currentParams],
  );

  const loadMore = useCallback(async () => {
    if (loading || pagination.page >= pagination.totalPages) return;

    const nextPage = pagination.page + 1;
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryService.list({
        ...currentParams,
        page: nextPage,
      });

      setItems((prev) => [...prev, ...response.items]);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error("Error loading more:", err);
      setError("Error al cargar más productos");
    } finally {
      setLoading(false);
    }
  }, [loading, pagination.page, pagination.totalPages, currentParams]);

  const searchItems = useCallback(
    async (term: string) => {
      await fetchItems({
        ...currentParams,
        search: term,
        page: 1,
      });
    },
    [fetchItems, currentParams],
  );

  const refresh = useCallback(async () => {
    await fetchItems({
      ...currentParams,
      page: 1,
    });
  }, [fetchItems, currentParams]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchItems(initialParams);
  }, []); // Solo al montar

  return {
    items,
    loading,
    error,
    pagination,
    fetchItems,
    loadMore,
    searchItems,
    refresh,
    hasMore: pagination.page < pagination.totalPages,
  };
}
