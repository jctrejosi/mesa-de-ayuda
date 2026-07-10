export function FilterChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "bg-[#2563EB] text-white border-[#2563EB]"
          : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#93C5FD]"
      }`}
    >
      {label}
    </button>
  );
}
