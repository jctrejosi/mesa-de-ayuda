// src/types/api.types.ts

import { ReactNode } from "react";

// ============================================================
// AUTENTICACIÓN
// ============================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    employeeId: number;
    fullName: string;
    email: string | null;
    role: "admin" | "manager" | "employee";
  };
}

export interface UserProfile {
  account: Account;
  employee: Employee;
  person: Person;
  branchName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  companyName?: string | null;
}

// ============================================================
// USUARIOS
// ============================================================

export interface Account {
  id: number;
  employeeId: number;
  username: string;
  role: "admin" | "manager" | "employee";
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface Person {
  id: number;
  documentType: string | null;
  documentNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  birthDate: string | null;
  gender: string | null;
  email: string | null;
  personalEmail: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  photo: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  avatarColor: string | undefined;
  initials: ReactNode;
  id: number;
  personId: number;
  employeeCode: string | null;
  branchId: number | null;
  departmentId: number | null;
  positionId: number | null;
  hireDate: string | null;
  terminationDate: string | null;
  status: "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
}

export interface UserWithRelations {
  account: Account;
  employee: Employee;
  person: Person;
  branchName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  companyName?: string | null;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
  branchId?: number;
  departmentId?: number;
  positionId?: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "manager" | "employee";
  status?: "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
  branchName?: string;
  departmentName?: string;
  positionName?: string;
}

export interface CreateUserRequest {
  // Persona
  documentType?: string;
  documentNumber?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  email?: string;
  personalEmail?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  // Empleado
  employeeCode?: string;
  branchId?: number;
  departmentId?: number;
  positionId?: number;
  hireDate?: string;
  status?: "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
  // Cuenta
  username: string;
  password: string;
  active?: boolean;
  role?: "admin" | "manager" | "employee";
}

export type UpdateUserRequest = Partial<Omit<CreateUserRequest, "password">> & {
  password?: string;
  terminationDate?: string;
  active?: boolean;
};

export interface UserRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  employeeCode: string;
  role: "admin" | "manager" | "employee";
  status: "ACTIVE" | "INACTIVE" | "VACATION" | "SUSPENDED";
  branchName: string | null;
  departmentName: string | null;
  positionName: string | null;
  branchId?: number | null;
  departmentId?: number | null;
  positionId?: number | null;
  phone: string | null;
  documentNumber: string | null;
  hireDate: string | null;
  lastLogin: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserListResponse {
  users: UserRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  totalCompanies: number;
  totalBranches: number;
}

export interface AttendanceChartData {
  date: string;
  entries: number;
  exits: number;
  total: number;
}

export interface RecentAttendance {
  id: number;
  employeeName: string;
  employeeCode: string | null;
  checkType: string;
  time: string;
  distance: number | null;
  branchName: string;
}

export interface DepartmentStats {
  department: string;
  total: number;
  present: number;
  absent: number;
  rate: number;
}

export interface DailySummary {
  date: string;
  total: number;
  entries: number;
  exits: number;
  late: number;
}

export interface TopPunctualEmployee {
  employeeId: number;
  employeeName: string;
  employeeCode: string | null;
  onTimeCount: number;
  lateCount: number;
  punctualityRate: number;
}

// ============================================================
// EMPRESA / SUCURSAL
// ============================================================

export interface Company {
  id: number;
  name: string;
  nit: string | null;
  active: boolean;
  createdAt: string;
}

export interface Branch {
  id: number;
  companyId: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  allowedRadius: number | null;
  timezone: string | null;
  active: boolean;
  createdAt: string;
  requireGeolocation: boolean;
}

export interface Department {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
}

export interface Position {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

export interface ConfigSetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  settingType: "string" | "number" | "boolean" | "json" | null;
  description: string | null;
  companyId: number | null;
}
