import { AuditLog } from '../../../database/schema/audit-log.schema';

export interface AuditLogData {
  accountId?: number | null;
  moduleName: string;
  action: string;
  entityName: string;
  entityId?: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  moduleName?: string;
  action?: string;
  entityName?: string;
  entityId?: number;
  accountId?: number;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogPaginatedResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
