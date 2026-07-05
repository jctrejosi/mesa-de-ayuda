import { Injectable } from '@nestjs/common';
import { getDb } from '../../database/drizzle';
import {
  auditLog,
  type NewAuditLog,
  type AuditLog as AuditLogType,
} from '../../database/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { createContextLogger } from '../../utils/logger';
import {
  AuditLogData,
  AuditLogQuery,
  AuditLogPaginatedResponse,
} from './interfaces/audit-log.interface';

// Tipo para las condiciones de Drizzle
type DrizzleCondition = ReturnType<typeof eq> | ReturnType<typeof and>;

@Injectable()
export class AuditLogService {
  private readonly logger = createContextLogger('AuditLogService');

  private get db() {
    return getDb();
  }

  /**
   * Registra una entrada en el log de auditoría
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      const {
        accountId,
        moduleName,
        action,
        entityName,
        entityId,
        oldValues,
        newValues,
        ip,
        userAgent,
      } = data;

      const newAuditLog: NewAuditLog = {
        accountId: accountId || null,
        moduleName,
        action,
        entityName,
        entityId: entityId || null,
        oldValues: oldValues || null,
        newValues: newValues || null,
        ip: ip || null,
        userAgent: userAgent || null,
      };

      await this.db.insert(auditLog).values(newAuditLog);

      this.logger.debug(
        `Audit log creado: ${action} en ${entityName} (ID: ${entityId})`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al crear audit log: ${message}`);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene los logs de auditoría con paginación y filtros
   */
  async findAll(query: AuditLogQuery = {}): Promise<AuditLogPaginatedResponse> {
    const {
      page = 1,
      limit = 50,
      moduleName,
      action,
      entityName,
      entityId,
      accountId,
      startDate,
      endDate,
    } = query;
    const offset = (page - 1) * limit;

    // ✅ Tipar correctamente el array de condiciones
    const conditions: DrizzleCondition[] = [];

    if (moduleName) {
      conditions.push(eq(auditLog.moduleName, moduleName));
    }
    if (action) {
      conditions.push(eq(auditLog.action, action));
    }
    if (entityName) {
      conditions.push(eq(auditLog.entityName, entityName));
    }
    if (entityId) {
      conditions.push(eq(auditLog.entityId, entityId));
    }
    if (accountId) {
      conditions.push(eq(auditLog.accountId, accountId));
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(auditLog.createdAt, start));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(auditLog.createdAt, end));
    }

    // ✅ Usar and(...conditions) solo si hay condiciones
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await this.db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(auditLog)
      .where(whereClause);

    const total = Number(countResult[0]?.total || 0);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un log de auditoría por ID
   */
  async findById(id: number): Promise<AuditLogType | null> {
    const results = await this.db
      .select()
      .from(auditLog)
      .where(eq(auditLog.id, id))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Obtiene el historial de cambios de una entidad específica
   */
  async getEntityHistory(
    entityName: string,
    entityId: number,
  ): Promise<AuditLogType[]> {
    const logs = await this.db
      .select()
      .from(auditLog)
      .where(
        and(
          eq(auditLog.entityName, entityName),
          eq(auditLog.entityId, entityId),
        ),
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(100);

    return logs;
  }

  /**
   * Obtiene las acciones más recientes de un usuario
   */
  async getUserRecentActions(
    accountId: number,
    limit: number = 10,
  ): Promise<AuditLogType[]> {
    const logs = await this.db
      .select()
      .from(auditLog)
      .where(eq(auditLog.accountId, accountId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);

    return logs;
  }
}
