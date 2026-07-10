// ─── Main Inventory Screen ─────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { ProductDetail } from "./ProductDetail";
import { Package, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { FilterModal } from "./FilterModal";

type InvView = "list" | "detail";
type ItemStatus = "available" | "low" | "out";

interface FilterState {
  categories: string[];
  statuses: ItemStatus[];
  locations: string[];
}

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

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  description: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  supplier: string;
  price: number;
  lastUpdated: string;
  status: ItemStatus;
  image?: string;
}

const INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    category: "Electrónicos",
    description:
      "Laptop de alta gama con procesador Intel Core i7 de 12.ª generación, 16 GB RAM DDR5, SSD 512 GB NVMe. Ideal para trabajo de campo y presentaciones.",
    quantity: 45,
    minStock: 10,
    maxStock: 60,
    unit: "unidades",
    location: "Bodega A - Estante 3",
    supplier: "TechSupplier S.A.",
    price: 850.0,
    lastUpdated: "2026-07-10T10:30:00",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600&h=400&fit=crop&auto=format&q=80",
  },
  {
    id: 2,
    name: 'Monitor Samsung 27"',
    category: "Electrónicos",
    description:
      "Monitor curvo 27 pulgadas 4K UHD, panel VA, 144 Hz, HDR10. Conectividad HDMI 2.1 y DisplayPort 1.4. Ideal para diseño y productividad.",
    quantity: 8,
    minStock: 20,
    maxStock: 50,
    unit: "unidades",
    location: "Bodega B - Estante 1",
    supplier: "DisplayPro",
    price: 320.0,
    lastUpdated: "2026-07-09T15:20:00",
    status: "low",
    image:
      "https://images.unsplash.com/photo-1547658718-1cdaa0852790?w=600&h=400&fit=crop&auto=format&q=80",
  },
  {
    id: 3,
    name: "Silla Ergonómica Herman Miller",
    category: "Mobiliario",
    description:
      "Silla ergonómica de alta gama con soporte lumbar ajustable, apoyabrazos 4D, malla transpirable. Certificada para uso intensivo de 8+ horas.",
    quantity: 22,
    minStock: 5,
    maxStock: 30,
    unit: "unidades",
    location: "Bodega C - Piso 1",
    supplier: "OfficeWorld",
    price: 1200.0,
    lastUpdated: "2026-07-07T08:00:00",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1688578735427-994ecdea3ea4?w=600&h=400&fit=crop&auto=format&q=80",
  },
  {
    id: 4,
    name: "Teclado Mecánico Keychron K2",
    category: "Electrónicos",
    description:
      "Teclado mecánico TKL inalámbrico, switches Red, retroiluminación RGB, compatible con Mac y Windows. Batería 4000 mAh.",
    quantity: 30,
    minStock: 8,
    maxStock: 40,
    unit: "unidades",
    location: "Bodega A - Estante 5",
    supplier: "TechSupplier S.A.",
    price: 95.0,
    lastUpdated: "2026-07-08T13:00:00",
    status: "available",
  },
  {
    id: 5,
    name: "Mouse Logitech MX Master 3",
    category: "Electrónicos",
    description:
      "Mouse inalámbrico de alta precisión 8K DPI, rueda MagSpeed electromagnética, conectividad multi-dispositivo Bluetooth.",
    quantity: 6,
    minStock: 10,
    maxStock: 30,
    unit: "unidades",
    location: "Bodega A - Estante 5",
    supplier: "LogiParts",
    price: 99.0,
    lastUpdated: "2026-07-06T11:30:00",
    status: "low",
  },
  {
    id: 6,
    name: "Papel A4 80g/m² (resma 500h)",
    category: "Papelería",
    description:
      "Papel blanco tamaño A4, gramaje 80 g/m², apto para impresoras láser e inkjet. Certificación FSC.",
    quantity: 12,
    minStock: 20,
    maxStock: 100,
    unit: "resmas",
    location: "Bodega D - Anaquel 2",
    supplier: "PaperMax",
    price: 6.5,
    lastUpdated: "2026-07-05T09:00:00",
    status: "low",
  },
  {
    id: 7,
    name: "Tóner HP LaserJet 26A",
    category: "Consumibles",
    description:
      "Cartucho de tóner negro original para impresoras HP LaserJet M402 y M426. Rendimiento aproximado 3100 páginas.",
    quantity: 0,
    minStock: 5,
    maxStock: 20,
    unit: "unidades",
    location: "Bodega D - Anaquel 4",
    supplier: "HPStore",
    price: 45.0,
    lastUpdated: "2026-07-03T16:00:00",
    status: "out",
  },
  {
    id: 8,
    name: "Webcam Logitech C920 HD Pro",
    category: "Electrónicos",
    description:
      "Webcam Full HD 1080p/30fps, micrófono estéreo integrado, compatible con Zoom, Teams y Meet. Clip universal.",
    quantity: 18,
    minStock: 5,
    maxStock: 25,
    unit: "unidades",
    location: "Bodega A - Estante 4",
    supplier: "LogiParts",
    price: 79.0,
    lastUpdated: "2026-07-10T08:00:00",
    status: "available",
  },
  {
    id: 9,
    name: "Audífonos Sony WH-1000XM5",
    category: "Electrónicos",
    description:
      "Audífonos inalámbricos con cancelación de ruido líder en la industria, 30 h de batería, carga rápida USB-C.",
    quantity: 11,
    minStock: 3,
    maxStock: 15,
    unit: "unidades",
    location: "Bodega A - Estante 6",
    supplier: "SonyDist",
    price: 349.0,
    lastUpdated: "2026-07-09T12:00:00",
    status: "available",
  },
  {
    id: 10,
    name: "Desinfectante en Spray 1L",
    category: "Limpieza",
    description:
      "Solución desinfectante multiusos al 70% alcohol isopropílico. Apto para superficies electrónicas. Fragancia neutra.",
    quantity: 4,
    minStock: 15,
    maxStock: 50,
    unit: "litros",
    location: "Bodega E - Estante 1",
    supplier: "CleanPro",
    price: 3.8,
    lastUpdated: "2026-07-04T10:00:00",
    status: "low",
  },
  {
    id: 11,
    name: "Cable HDMI 2.1 (2m)",
    category: "Cables",
    description:
      "Cable HDMI 2.1 premium certificado, soporta 8K@60Hz y 4K@120Hz, trenzado de nylon, conectores dorados.",
    quantity: 0,
    minStock: 10,
    maxStock: 30,
    unit: "unidades",
    location: "Bodega A - Estante 2",
    supplier: "CableTech",
    price: 18.0,
    lastUpdated: "2026-07-01T14:30:00",
    status: "out",
  },
  {
    id: 12,
    name: 'MacBook Pro 14" M3 Pro',
    category: "Electrónicos",
    description:
      'Laptop Apple con chip M3 Pro, 18 GB memoria unificada, SSD 512 GB. Pantalla Liquid Retina XDR 14.2".',
    quantity: 7,
    minStock: 3,
    maxStock: 12,
    unit: "unidades",
    location: "Bodega A - Estante 1",
    supplier: "AppleDist",
    price: 1999.0,
    lastUpdated: "2026-07-10T07:30:00",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&h=400&fit=crop&auto=format&q=80",
  },
];

export function InventoryScreen() {
  const [invView, setInvView] = useState<InvView>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    statuses: [],
    locations: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let items = INVENTORY;
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    if (filters.categories.length)
      items = items.filter((i) => filters.categories.includes(i.category));
    if (filters.statuses.length)
      items = items.filter((i) => filters.statuses.includes(i.status));
    if (filters.locations.length)
      items = items.filter((i) =>
        filters.locations.some((l) => i.location.startsWith(l)),
      );
    return items;
  }, [query, filters]);

  const activeFilters =
    filters.categories.length +
    filters.statuses.length +
    filters.locations.length;
  const selectedItem = INVENTORY.find((i) => i.id === selectedId);
  const stats = {
    total: INVENTORY.length,
    low: INVENTORY.filter((i) => i.status === "low").length,
    out: INVENTORY.filter((i) => i.status === "out").length,
  };

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
            onClick={() => setLoading(true)}
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
              placeholder="Buscar producto, categoría…"
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

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.categories.map((c) => (
              <ActiveFilterChip
                key={c}
                label={c}
                onRemove={() =>
                  setFilters((p) => ({
                    ...p,
                    categories: p.categories.filter((x) => x !== c),
                  }))
                }
              />
            ))}
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
            {filters.locations.map((l) => (
              <ActiveFilterChip
                key={l}
                label={l}
                onRemove={() =>
                  setFilters((p) => ({
                    ...p,
                    locations: p.locations.filter((x) => x !== l),
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-[13px] text-[#64748B] font-medium">
              Cargando inventario…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
              <Package size={28} className="text-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-[#0F1523]">Sin resultados</p>
            <p className="text-[13px] text-[#64748B]">
              Intenta con otros términos o ajusta los filtros.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setFilters({ categories: [], statuses: [], locations: [] });
              }}
              className="text-[13px] font-semibold text-[#2563EB]"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onTap={() => {
                  setSelectedId(item.id);
                  setInvView("detail");
                }}
              />
            ))}
            <p className="text-center text-[11px] text-[#94A3B8] pt-2">
              {filtered.length} de {INVENTORY.length} productos
            </p>
          </div>
        )}
      </div>

      {showFilters && (
        <FilterModal
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

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
