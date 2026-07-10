import { Filter, X } from "lucide-react";
import { useState } from "react";
import { FilterChip } from "./FilterChip";

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

const LOCATIONS = [
  ...new Set(INVENTORY.map((i) => i.location.split(" - ")[0])),
];

// ─── Status helpers ────────────────────────────────────────────────────────────

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

const CATEGORIES = [...new Set(INVENTORY.map((i) => i.category))];

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

type ItemStatus = "available" | "low" | "out";

interface FilterState {
  categories: string[];
  statuses: ItemStatus[];
  locations: string[];
}

export function FilterModal({
  filters,
  onChange,
  onClose,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  const toggleCat = (c: string) =>
    setLocal((p) => ({
      ...p,
      categories: p.categories.includes(c)
        ? p.categories.filter((x) => x !== c)
        : [...p.categories, c],
    }));
  const toggleStatus = (s: ItemStatus) =>
    setLocal((p) => ({
      ...p,
      statuses: p.statuses.includes(s)
        ? p.statuses.filter((x) => x !== s)
        : [...p.statuses, s],
    }));
  const toggleLoc = (l: string) =>
    setLocal((p) => ({
      ...p,
      locations: p.locations.includes(l)
        ? p.locations.filter((x) => x !== l)
        : [...p.locations, l],
    }));

  const activeCount =
    local.categories.length + local.statuses.length + local.locations.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[24px] animate-[slideUp_0.3s_ease_both]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E2E8F0]" />
        </div>

        <div className="px-5 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-[#0F1523] text-[17px]">Filtros</h3>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={() =>
                  setLocal({ categories: [], statuses: [], locations: [] })
                }
                className="text-[12px] text-[#2563EB] font-semibold"
              >
                Limpiar ({activeCount})
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center"
            >
              <X size={16} className="text-[#64748B]" />
            </button>
          </div>
        </div>

        <div
          className="px-5 pb-6 space-y-5 max-h-[70vh] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Categories */}
          <FilterSection label="Categoría">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={local.categories.includes(c)}
                  onToggle={() => toggleCat(c)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection label="Estado">
            <div className="flex gap-2">
              {(["available", "low", "out"] as ItemStatus[]).map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_CONFIG[s].label}
                  active={local.statuses.includes(s)}
                  onToggle={() => toggleStatus(s)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection label="Bodega">
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <FilterChip
                  key={l}
                  label={l}
                  active={local.locations.includes(l)}
                  onToggle={() => toggleLoc(l)}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        <div className="px-5 pb-8 pt-2 border-t border-[#F1F5F9]">
          <button
            onClick={() => {
              onChange(local);
              onClose();
            }}
            className="w-full h-[50px] rounded-[14px] bg-[#2563EB] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)]"
          >
            <Filter size={16} />
            Aplicar filtros
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white/30 text-[11px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
