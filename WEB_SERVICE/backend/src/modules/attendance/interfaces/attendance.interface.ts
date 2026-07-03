import { Attendance } from '../../../database/schema/attendance.schema';

export type AttendanceCheckType =
  'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

export type AttendanceRecord = Attendance;

export interface AttendanceWithRelations extends Attendance {
  employeeName?: string;
  employeeCode?: string;
  branchName?: string;
  companyName?: string;
}

export interface AttendanceStats {
  total: number;
  entries: number;
  exits: number;
  breaks: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

export interface AttendanceValidationResult {
  isValid: boolean;
  distance?: number;
  maxRadius?: number;
  isWithinRadius: boolean;
  message?: string;
}
