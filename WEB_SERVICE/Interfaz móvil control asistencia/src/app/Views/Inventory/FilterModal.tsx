import { Filter, X } from "lucide-react";
import { useState } from "react";
import { FilterChip } from "./FilterChip";

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

// Estado de filtros unificado: siempre tiene statuses, y opcionalmente categories y locations
export interface FilterState {
  statuses: ItemStatus[];
  categories?: string[];
  locations?: string[];
}

interface FilterModalProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  categoriesOptions?: string[]; // opciones para categorías (si se pasan, se muestra la sección)
  locationsOptions?: string[]; // opciones para ubicaciones (si se pasan, se muestra la sección)
}

export function FilterModal({
  filters,
  onChange,
  onClose,
  categoriesOptions = [],
  locationsOptions = [],
}: FilterModalProps) {
  // Inicializar local con los valores actuales, asegurando que existan categories y locations
  const [local, setLocal] = useState<FilterState>({
    statuses: filters.statuses,
    categories: filters.categories || [],
    locations: filters.locations || [],
  });

  const toggleCat = (c: string) =>
    setLocal((p) => ({
      ...p,
      categories: (p.categories || []).includes(c)
        ? (p.categories || []).filter((x) => x !== c)
        : [...(p.categories || []), c],
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
      locations: (p.locations || []).includes(l)
        ? (p.locations || []).filter((x) => x !== l)
        : [...(p.locations || []), l],
    }));

  const activeCount =
    (local.categories || []).length +
    local.statuses.length +
    (local.locations || []).length;

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
                  setLocal({ statuses: [], categories: [], locations: [] })
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
          {/* Categories - solo si hay opciones */}
          {categoriesOptions.length > 0 && (
            <FilterSection label="Categoría">
              <div className="flex flex-wrap gap-2">
                {categoriesOptions.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={(local.categories || []).includes(c)}
                    onToggle={() => toggleCat(c)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Status - siempre visible */}
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

          {/* Location - solo si hay opciones */}
          {locationsOptions.length > 0 && (
            <FilterSection label="Bodega">
              <div className="flex flex-wrap gap-2">
                {locationsOptions.map((l) => (
                  <FilterChip
                    key={l}
                    label={l}
                    active={(local.locations || []).includes(l)}
                    onToggle={() => toggleLoc(l)}
                  />
                ))}
              </div>
            </FilterSection>
          )}
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
