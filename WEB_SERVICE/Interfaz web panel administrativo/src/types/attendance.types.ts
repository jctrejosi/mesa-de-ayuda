export interface ComparativeStats {
  present: {
    today: number;
    yesterday: number;
  };
  pending: {
    today: number;
    yesterday: number;
  };
  late: {
    today: number;
    yesterday: number;
  };
}

export interface AttendanceRecord {
  employee?: Employee;
  status: string;
  type: string;
  id: number;
  employeeId: number;
  branchId: number;
  checkType: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  latitude: string | null;
  longitude: string | null;
  accuracy: number | null;
  distance: number | null;
  ip: string | null;
  device: string | null;
  createdAt: string;
}

export interface AttendanceWithRelations {
  id: number;
  employee: {
    code: string;
    fullName: string;
    photo: string | null;
  };
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm:ss'
  type: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  status: "APPROVED" | "LATE" | "REJECTED";
  distance: number | null;
  branch: {
    name: string;
    address: string | null;
  };
  createdAt: string;
}

export interface AttendanceHistoryQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  status?: "APPROVED" | "LATE" | "REJECTED";
  search?: string;
}

export interface AttendanceListResponse {
  records: AttendanceWithRelations[];
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
}

export type StatusType = "approved" | "rejected" | "late";
export type RecordType = "entry" | "exit";

export interface Employee {
  id: string;
  name: string;
  code: string;
  role: string;
  avatar: string;
  initials: string;
  avatarColor: string;
}

export interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export interface KPICardProps {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export interface Filters {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}
