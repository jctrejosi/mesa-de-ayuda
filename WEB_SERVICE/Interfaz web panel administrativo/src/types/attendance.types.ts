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

export interface Employee {
  code: string;
  fullName: string;
  photo: string | null;
}

export type StatusType = "approved" | "rejected" | "late";
export type RecordType = "entry" | "exit";

export interface AttendanceRecord {
  id: number;
  employee: Employee;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm:ss'
  type: RecordType;
  status: StatusType;
  distance: number | null;
  branch: {
    name: string;
    address: string | null;
  };
  createdAt: string;
}
export interface AttendanceHistoryQueryParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  type?: RecordType;
  status?: StatusType;
  search?: string;
}

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
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
