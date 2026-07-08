export type StatusType = "approved" | "rejected" | "late";
export type RecordType = "entry" | "exit";
export type ViewType =
  | "attendance"
  | "config"
  | "users"
  | "sales"
  | "inventory";
export type UserStatus = "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
export type UserRole = "admin" | "manager" | "employee";
export type SortDir = "asc" | "desc" | null;

export interface Employee {
  id: string;
  name: string;
  code: string;
  role: string;
  avatar: string;
  initials: string;
  avatarColor: string;
}
export interface AttendanceRecord {
  id: string;
  employee: Employee;
  date: string;
  time: string;
  type: RecordType;
  status: StatusType;
  distance: number;
  coordinates: { lat: number; lng: number };
  gpsAccuracy: number;
}
export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  username: string;
  employeeCode: string;
  role: UserRole;
  status: UserStatus;
  branchName: string;
  department: string;
  position: string;
  phone: string;
  document: string;
  hireDate: string;
  lastLogin: string;
  isActive: boolean;
  initials: string;
  avatarColor: string;
}
export interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}
export interface UserFiltersState {
  search: string;
  role: string;
  status: string;
  branch: string;
  department: string;
}

export interface SaleMonth {
  month: string;
  shortMonth: string;
  value: number;
  monthIndex: number;
}
export interface Product {
  id: string;
  code: string;
  plu: string;
  ean: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}
