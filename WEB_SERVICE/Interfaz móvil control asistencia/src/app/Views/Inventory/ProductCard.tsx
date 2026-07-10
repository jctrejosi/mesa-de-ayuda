import { AlertTriangle, Box, Warehouse } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { StockBar } from "./StockBar";
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(
    n,
  );
type ItemStatus = "available" | "low" | "out";
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

export function ProductCard({
  item,
  onTap,
}: {
  item: InventoryItem;
  onTap: () => void;
}) {
  const lowAlert = item.status === "low" || item.status === "out";
  return (
    <button
      onClick={onTap}
      className={`w-full text-left bg-white rounded-[18px] shadow-[0_2px_12px_rgba(15,23,42,0.07)] overflow-hidden active:scale-[0.99] transition-all ${
        lowAlert ? "ring-1 ring-inset ring-[#FCD34D]/60" : ""
      }`}
    >
      <div className="flex gap-3 p-3.5">
        {/* Image / Icon */}
        <div className="shrink-0 w-[70px] h-[70px] rounded-[12px] overflow-hidden bg-[#F1F5F9] flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Box size={28} className="text-[#94A3B8]" strokeWidth={1.5} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[#0F1523] text-[14px] leading-tight truncate">
                {item.name}
              </p>
              <span className="text-[11px] text-[#64748B] font-medium">
                {item.category}
              </span>
            </div>
            <StatusBadge status={item.status} size="xs" />
          </div>

          <div className="mt-2 space-y-1.5">
            <StockBar
              quantity={item.quantity}
              min={item.minStock}
              max={item.maxStock}
            />
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${item.status === "out" ? "text-[#DC2626]" : item.status === "low" ? "text-[#CA8A04]" : "text-[#15803D]"}`}
              >
                {item.quantity} {item.unit}
              </span>
              <span className="text-xs font-semibold text-[#2563EB]">
                {fmtCurrency(item.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            <Warehouse size={10} className="text-[#94A3B8]" />
            <span className="text-[10px] text-[#94A3B8] truncate">
              {item.location}
            </span>
          </div>
        </div>
      </div>

      {lowAlert && (
        <div
          className={`px-3.5 py-2 flex items-center gap-2 border-t ${
            item.status === "out"
              ? "bg-[#FEF2F2] border-[#FECACA]"
              : "bg-[#FFFBEB] border-[#FDE68A]"
          }`}
        >
          <AlertTriangle
            size={11}
            className={
              item.status === "out" ? "text-[#DC2626]" : "text-[#D97706]"
            }
          />
          <span
            className={`text-[10px] font-semibold ${item.status === "out" ? "text-[#B91C1C]" : "text-[#92400E]"}`}
          >
            {item.status === "out"
              ? "Sin stock — solicitar reposición urgente"
              : `Stock mínimo: ${item.minStock} ${item.unit} — reponer pronto`}
          </span>
        </div>
      )}
    </button>
  );
}
