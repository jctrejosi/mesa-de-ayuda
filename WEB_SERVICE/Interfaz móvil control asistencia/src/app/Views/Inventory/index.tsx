// ─── Main Inventory Screen ─────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { ProductDetail } from "./ProductDetail";
import { Package, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { FilterModal, type FilterState } from "./FilterModal";
import { useInventory } from "../../../hook/useInventory";
import type { InventoryItem as BackendItem } from "../../../services/inventory.service";

type InvView = "list" | "detail";
type ItemStatus = "available" | "low" | "out";

// Configuración de estados para mostrar en badges y chips
const STATUS_CONFIG = {
  available: {
    label: "Disponible",
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#16A34A]",
  },
  low: {
    label: "Bajo stock",
    bg: "bg-[#FEF9C3]",
    text: "text-[#A16207]",
    dot: "bg-[#CA8A04]",
  },
  out: {
    label: "Agotado",
    bg: "bg-[#FEE2E2]",
    text: "text-[#B91C1C]",
    dot: "bg-[#DC2626]",
  },
};

// Umbral para considerar bajo stock (si saldo < 5 -> low)
const LOW_STOCK_THRESHOLD = 5;

// Mapear estado según saldo
const getStatus = (saldo: number): ItemStatus => {
  if (saldo <= 0) return "out";
  if (saldo < LOW_STOCK_THRESHOLD) return "low";
  return "available";
};

// Mapear un item del backend al formato que espera ProductCard / ProductDetail
const mapBackendItem = (backendItem: BackendItem) => {
  const status = getStatus(backendItem.saldo);
  return {
    id: backendItem.codigo, // usamos codigo como id (string)
    name: backendItem.nombre,
    category: "General", // no tenemos categoría, asignamos un valor por defecto
    description: `Código: ${backendItem.codigo} | PLU: ${backendItem.plu || "N/A"} | EAN: ${backendItem.ean || "N/A"}`,
    quantity: backendItem.saldo,
    minStock: LOW_STOCK_THRESHOLD,
    maxStock: backendItem.saldo * 2 || 100,
    unit: "unidades",
    location: "Bodega principal",
    supplier: "Proveedor",
    price: backendItem.precio_venta,
    lastUpdated: backendItem.updatedAt || new Date().toISOString(),
    status,
    image: backendItem.imagen || undefined,
  };
};

export function InventoryScreen() {
  const [invView, setInvView] = useState<InvView>("list");
  const [selectedItem, setSelectedItem] = useState<ReturnType<
    typeof mapBackendItem
  > | null>(null);
  const [query, setQuery] = useState("");

  // Estado de filtros unificado (compatible con FilterModal)
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    categories: [],
    locations: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  // Hook para obtener inventario del backend
  const {
    items: backendItems,
    loading,
    error,
    pagination,
    searchItems,
    refresh,
    loadMore,
    hasMore,
  } = useInventory({ limit: 20 });

  // Mapear los items del backend al formato del frontend
  const mappedItems = useMemo(
    () => backendItems.map(mapBackendItem),
    [backendItems],
  );

  // Aplicar filtros locales: solo por estado (categorías y ubicaciones no se usan)
  const filteredItems = useMemo(() => {
    let result = mappedItems;
    if (filters.statuses.length > 0) {
      result = result.filter((item) => filters.statuses.includes(item.status));
    }
    return result;
  }, [mappedItems, filters]);

  // Estadísticas calculadas sobre los items mapeados
  const stats = useMemo(() => {
    const total = mappedItems.length;
    const low = mappedItems.filter((i) => i.status === "low").length;
    const out = mappedItems.filter((i) => i.status === "out").length;
    return { total, low, out };
  }, [mappedItems]);

  const activeFilters =
    filters.statuses.length +
    (filters.categories?.length || 0) +
    (filters.locations?.length || 0);

  // Manejador de búsqueda
  const handleSearch = () => {
    if (query.trim()) {
      searchItems(query.trim());
    } else {
      refresh();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Limpiar búsqueda y filtros
  const clearAll = () => {
    setQuery("");
    setFilters({ statuses: [], categories: [], locations: [] });
    refresh();
  };

  // Si estamos en vista de detalle y hay item seleccionado
  if (invView === "detail" && selectedItem) {
    return (
      <ProductDetail item={selectedItem} onBack={() => setInvView("list")} />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-[#F5F7FA]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#0F1523] text-[20px]">Inventario</h2>
            <p className="text-[12px] text-[#64748B]">
              {stats.total} productos · {stats.low} bajo stock · {stats.out}{" "}
              agotados
            </p>
          </div>
          <button
            onClick={refresh}
            className="w-9 h-9 rounded-full bg-white shadow-sm border border-black/[0.06] flex items-center justify-center text-[#475569]"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-[#2563EB]",
              bg: "bg-[#EFF3FF]",
            },
            {
              label: "Bajo stock",
              value: stats.low,
              color: "text-[#D97706]",
              bg: "bg-[#FFFBEB]",
            },
            {
              label: "Agotados",
              value: stats.out,
              color: "text-[#DC2626]",
              bg: "bg-[#FEF2F2]",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-[12px] p-2.5 text-center`}
            >
              <p className={`font-bold text-[18px] ${s.color}`}>{s.value}</p>
              <p className={`text-[10px] font-semibold ${s.color} opacity-80`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-[12px] px-3 h-10 shadow-sm focus-within:border-[#2563EB] transition-colors">
            <Search size={15} className="text-[#94A3B8] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por código, nombre, PLU o EAN…"
              className="flex-1 bg-transparent text-[13px] text-[#0F1523] placeholder:text-[#CBD5E1] outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={13} className="text-[#94A3B8]" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={`relative w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm border transition-colors ${
              activeFilters > 0
                ? "bg-[#2563EB] border-[#2563EB] text-white"
                : "bg-white border-[#E2E8F0] text-[#475569]"
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips (solo estado, porque no tenemos categorías ni ubicaciones) */}
        {filters.statuses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.statuses.map((s) => (
              <ActiveFilterChip
                key={s}
                label={STATUS_CONFIG[s].label}
                onRemove={() =>
                  setFilters((p) => ({
                    ...p,
                    statuses: p.statuses.filter((x) => x !== s),
                  }))
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {loading && mappedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-[13px] text-[#64748B] font-medium">
              Cargando inventario…
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <Package size={28} className="text-[#DC2626]" />
            </div>
            <p className="font-semibold text-[#DC2626]">Error al cargar</p>
            <p className="text-[13px] text-[#64748B]">{error}</p>
            <button
              onClick={refresh}
              className="text-[13px] font-semibold text-[#2563EB]"
            >
              Reintentar
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
              <Package size={28} className="text-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-[#0F1523]">Sin resultados</p>
            <p className="text-[13px] text-[#64748B]">
              {query
                ? "No se encontraron productos con esa búsqueda."
                : "No hay productos disponibles."}
            </p>
            {(query || activeFilters > 0) && (
              <button
                onClick={clearAll}
                className="text-[13px] font-semibold text-[#2563EB]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onTap={() => {
                  setSelectedItem(item);
                  setInvView("detail");
                }}
              />
            ))}
            {/* Cargar más */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 bg-white rounded-[16px] border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Cargar más productos"
                )}
              </button>
            )}
            <p className="text-center text-[11px] text-[#94A3B8] pt-2">
              Mostrando {filteredItems.length} de {pagination.total} productos
            </p>
          </div>
        )}
      </div>

      {showFilters && (
        <FilterModal
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          categoriesOptions={[]} // no tenemos categorías
          locationsOptions={[]} // no tenemos ubicaciones
        />
      )}
    </div>
  );
}

// Componente auxiliar para mostrar chips de filtro activos
function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#EFF3FF] text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#BFDBFE]">
      {label}
      <button onClick={onRemove} className="ml-0.5">
        <X size={10} />
      </button>
    </span>
  );
}
