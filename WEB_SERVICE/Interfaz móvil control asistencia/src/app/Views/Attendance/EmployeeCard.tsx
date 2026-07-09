import { MapPin } from "lucide-react";

export function EmployeeCard({ employee }: { employee: any }) {
  const EMPLOYEE = employee;
  return (
    <div className="mx-4 bg-white rounded-[20px] shadow-[0_2px_16px_rgba(15,23,42,0.08)] p-4 flex items-center gap-4">
      <div className="relative shrink-0">
        <img
          src={EMPLOYEE.avatar}
          alt={EMPLOYEE.name}
          className="w-[60px] h-[60px] rounded-full object-cover bg-[#E8ECF2]"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-[#0F1523] text-[15px] truncate">
          {EMPLOYEE.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#64748B] font-medium">
            {EMPLOYEE.code}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
          <span className="text-xs text-[#64748B] truncate">
            {EMPLOYEE.role}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-[#EFF3FF] text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <MapPin size={10} />
            {EMPLOYEE.area}
          </span>
        </div>
      </div>
    </div>
  );
}
