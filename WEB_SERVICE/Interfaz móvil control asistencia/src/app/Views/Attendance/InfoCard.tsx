import { Info } from "lucide-react";

export function InfoCard() {
  return (
    <div className="mx-4 bg-[#EFF3FF] rounded-[16px] p-4 flex items-start gap-3">
      <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
      <p className="text-xs text-[#3B5EA6] leading-relaxed">
        El registro únicamente puede realizarse dentro del área autorizada. La
        ubicación se verifica automáticamente.
      </p>
    </div>
  );
}
