import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene estadísticas generales del dashboard
   * GET /api/dashboard/stats
   */
  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * Obtiene datos para el gráfico de asistencia
   * GET /api/dashboard/chart?days=7
   */
  @Get('chart')
  async getChart(
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ) {
    return this.dashboardService.getAttendanceChart(days);
  }

  /**
   * Obtiene los registros de asistencia más recientes
   * GET /api/dashboard/recent?limit=10
   */
  @Get('recent')
  async getRecent(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.dashboardService.getRecentAttendance(limit);
  }

  /**
   * Obtiene estadísticas por departamento
   * GET /api/dashboard/departments
   */
  @Get('departments')
  async getDepartmentStats() {
    return this.dashboardService.getDepartmentStats();
  }

  /**
   * Obtiene el resumen diario de asistencia
   * GET /api/dashboard/daily?days=7
   */
  @Get('daily')
  async getDailySummary(
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
  ) {
    return this.dashboardService.getDailySummary(days);
  }

  /**
   * Obtiene el top de empleados más puntuales
   * GET /api/dashboard/top-punctual?limit=5
   */
  @Get('top-punctual')
  async getTopPunctual(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 5,
  ) {
    return this.dashboardService.getTopPunctualEmployees(limit);
  }
}
