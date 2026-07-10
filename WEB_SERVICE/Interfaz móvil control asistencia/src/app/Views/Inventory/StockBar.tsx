export function StockBar({
  quantity,
  min,
  max,
}: {
  quantity: number;
  min: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min((quantity / max) * 100, 100) : 0;
  const color =
    quantity === 0
      ? "bg-[#DC2626]"
      : quantity < min
        ? "bg-[#CA8A04]"
        : "bg-[#16A34A]";
  return (
    <div className="w-full h-1.5 bg-[#E8ECF2] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
