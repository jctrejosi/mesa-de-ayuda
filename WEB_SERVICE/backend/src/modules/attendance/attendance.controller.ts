import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../interfaces/request.interface';
import { ValidateLocationDto } from './dto/validate-location.dto';

// Interfaz para la request con los campos que necesitamos
type RequestWithIp = Omit<Request, 'connection'> & {
  ip: string;
  connection?: {
    remoteAddress?: string;
  };
};

@Controller('attendance') // <-- ESTE DECORADOR ES OBLIGATORIO
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ============================================================
  // RUTAS PARA EMPLEADOS (autenticados)
  // ============================================================

  /**
   * Validar ubicación sin registrar
   * POST /api/attendance/validate-location
   */
  @Post('validate-location')
  @HttpCode(HttpStatus.OK)
  async validateLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ValidateLocationDto,
  ) {
    return this.attendanceService.validateEmployeeLocation(
      user.employeeId,
      dto,
    );
  }

  /**
   * Registrar asistencia
   * POST /api/attendance/register
   */
  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterAttendanceDto,
    @Req() req: RequestWithIp,
  ) {
    // Obtener IP real (priorizando x-forwarded-for para proxies)
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = forwardedFor
      ? (Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0]
        ).trim()
      : req.ip || req.connection?.remoteAddress || 'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.attendanceService.register(user.employeeId, dto, ip, userAgent);
  }

  /**
   * Obtener asistencia de hoy
   * GET /api/attendance/today
   */
  @Get('today')
  async getToday(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getTodayAttendance(user.employeeId);
  }

  /**
   * Obtener historial de asistencia
   * GET /api/attendance/history
   */
  @Get('history')
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getHistory(user.employeeId, query);
  }

  /**
   * Verificar si puede registrar
   * GET /api/attendance/can-register/:type
   */
  @Get('can-register/:type')
  async canRegister(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type') type: string,
  ) {
    return this.attendanceService.canRegister(user.employeeId, type);
  }

  /**
   * Obtener estadísticas de asistencia
   * GET /api/attendance/stats
   */
  @Get('stats')
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getStats(user.employeeId);
  }

  // ============================================================
  // RUTAS PARA ADMINISTRADORES
  // ============================================================

  /**
   * Obtener todos los registros (admin)
   * GET /api/attendance/admin
   */
  @Get('admin')
  @Roles('admin', 'manager')
  async getAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.getHistory(query.employeeId || 0, query);
  }

  /**
   * Obtener registro por ID (admin)
   * GET /api/attendance/admin/:id
   */
  @Get('admin/:id')
  @Roles('admin', 'manager')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findByIdWithRelations(id);
  }

  /**
   * Actualizar registro (admin)
   * PUT /api/attendance/admin/:id
   */
  @Put('admin/:id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  /**
   * Eliminar registro (admin)
   * DELETE /api/attendance/admin/:id
   */
  @Delete('admin/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.attendanceService.delete(id);
  }
}
