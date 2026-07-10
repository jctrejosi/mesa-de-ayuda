import {
  ArrowLeft,
  BarChart3,
  Box,
  Calendar,
  Tag,
  Truck,
  Warehouse,
} from "lucide-react";
import { StockBar } from "./StockBar";

// ─── Detail Screen ─────────────────────────────────────────────────────────────
type ItemStatus = "available" | "low" | "out";

// Interface que coincide con el item mapeado en InventoryScreen
export interface InventoryItem {
  id: string; // ahora es string (código)
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

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(
    n,
  );

const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "hace menos de 1 h";
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
};

export function ProductDetail({
  item,
  onBack,
}: {
  item: InventoryItem;
  onBack: () => void;
}) {
  const sc = STATUS_CONFIG[item.status];
  const stockPct = Math.min((item.quantity / item.maxStock) * 100, 100);

  return (
    <div
      className="flex-1 overflow-y-auto overscroll-contain"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F5F7FA] px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm border border-black/[0.06] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-[#475569]" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-widest">
            {item.category}
          </p>
          <h2 className="font-bold text-[#0F1523] text-[16px] truncate">
            {item.name}
          </h2>
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}
        >
          {sc.label}
        </span>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {/* Hero image */}
        <div className="w-full h-[200px] rounded-[20px] overflow-hidden bg-[#E8ECF2] flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
              <Box size={48} strokeWidth={1.2} />
              <span className="text-[12px] font-medium">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Price & ID */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#64748B] font-medium">
              Precio unitario
            </p>
            <p className="text-2xl font-bold text-[#2563EB]">
              {fmtCurrency(item.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#64748B] font-medium">
              Código producto
            </p>
            <p className="text-[14px] font-bold text-[#0F1523]">#{item.id}</p>
          </div>
        </div>

        {/* Stock card */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
            Stock actual
          </p>
          <div className="flex items-end gap-1.5 mb-3">
            <span
              className={`text-3xl font-bold ${item.status === "out" ? "text-[#DC2626]" : item.status === "low" ? "text-[#CA8A04]" : "text-[#15803D]"}`}
            >
              {item.quantity}
            </span>
            <span className="text-[14px] text-[#64748B] mb-1">{item.unit}</span>
          </div>
          <StockBar
            quantity={item.quantity}
            min={item.minStock}
            max={item.maxStock}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[#94A3B8]">
              Mín: {item.minStock}
            </span>
            <span className="text-[10px] text-[#94A3B8]">
              {Math.round(stockPct)}% del máx
            </span>
            <span className="text-[10px] text-[#94A3B8]">
              Máx: {item.maxStock}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4 space-y-3">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
            Información
          </p>
          {[
            {
              icon: <Warehouse size={14} />,
              label: "Ubicación",
              value: item.location,
            },
            {
              icon: <Truck size={14} />,
              label: "Proveedor",
              value: item.supplier,
            },
            { icon: <Tag size={14} />, label: "Unidad", value: item.unit },
            {
              icon: <Calendar size={14} />,
              label: "Última actualización",
              value: fmtRelative(item.lastUpdated),
            },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0 last:pb-0 first:pt-0"
            >
              <div className="flex items-center gap-2 text-[#64748B]">
                {icon}
                <span className="text-[12px]">{label}</span>
              </div>
              <span className="text-[12px] font-semibold text-[#0F1523] max-w-[55%] text-right">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
            Descripción
          </p>
          <p className="text-[13px] text-[#475569] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Movements - se muestra siempre vacío (no tenemos datos) */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] p-4">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
            Movimientos recientes
          </p>
          <p className="text-[13px] text-[#94A3B8] text-center py-4">
            Sin movimientos registrados
          </p>
        </div>

        {/* Action */}
        <button className="w-full h-[50px] rounded-[14px] bg-[#EFF3FF] text-[#2563EB] font-semibold text-[14px] flex items-center justify-center gap-2 border border-[#BFDBFE]">
          <BarChart3 size={17} />
          Ver estadísticas de consumo
        </button>
      </div>
    </div>
  );
}
