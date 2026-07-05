import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import type { AuditLogQuery } from './interfaces/audit-log.interface';
import { AuditLog } from '../../database/schema/audit-log.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Obtener todos los logs de auditoría (con paginación y filtros)
   * GET /api/audit-logs
   */
  @Get()
  async findAll(@Query() query: AuditLogQuery) {
    return this.auditLogService.findAll(query);
  }

  /**
   * Obtener un log de auditoría por ID
   * GET /api/audit-logs/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AuditLog> {
    const log = await this.auditLogService.findById(id);
    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return log;
  }

  /**
   * Obtener historial de cambios de una entidad
   * GET /api/audit-logs/entity/:entityName/:entityId
   */
  @Get('entity/:entityName/:entityId')
  async getEntityHistory(
    @Param('entityName') entityName: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<AuditLog[]> {
    return this.auditLogService.getEntityHistory(entityName, entityId);
  }

  /**
   * Obtener acciones recientes de un usuario
   * GET /api/audit-logs/user/:accountId
   */
  @Get('user/:accountId')
  async getUserActions(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.auditLogService.getUserRecentActions(accountId, limitNum);
  }
}
