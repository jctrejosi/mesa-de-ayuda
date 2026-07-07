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
  employee?: any;
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

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface AttendanceWithRelations extends AttendanceRecord {
  employee?: {
    id: number;
    code: string | null;
    fullName: string;
  };
  branch?: {
    id: number;
    name: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  };
}

export interface AttendanceQueryParams {
  startDate?: string;
  endDate?: string;
  type?: "ENTRY" | "EXIT" | "BREAK_START" | "BREAK_END";
  employeeId?: number;
  branchId?: number;
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "checkType" | "distance";
  orderDirection?: "ASC" | "DESC";
}
