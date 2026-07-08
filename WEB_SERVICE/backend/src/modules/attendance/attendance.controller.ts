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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AttendanceHistoryQueryDto } from './dto/attendance-history-query.dto';
import { AttendanceHistoryResponseDto } from './dto/attendance-history-response.dto';

type RequestWithIp = Omit<Request, 'connection'> & {
  ip: string;
  connection?: {
    remoteAddress?: string;
  };
};

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ============================================================
  // EMPLOYEE ENDPOINTS
  // ============================================================

  @Post('history')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary:
      '[Admin/Manager] Historial avanzado con paginación, filtros y estado calculado',
    description:
      'Retorna historial completo con foto, nombre, código, sucursal y estado (APPROVED/LATE/REJECTED).',
  })
  @ApiBody({ type: AttendanceHistoryQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Historial avanzado paginado',
    type: AttendanceHistoryResponseDto,
  })
  async getAttendanceHistory(
    @Body() body: AttendanceHistoryQueryDto,
  ): Promise<AttendanceHistoryResponseDto> {
    return this.attendanceService.getAttendanceHistory(body);
  }

  @Post('validate-location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar ubicación sin registrar',
    description:
      'Valida si la ubicación del empleado está dentro del radio permitido. No crea un registro de asistencia.',
  })
  @ApiBody({ type: ValidateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Ubicación validada exitosamente',
    schema: {
      example: {
        isValid: true,
        message: 'Ubicación válida. Distancia: 12m',
        distance: 12,
        maxRadius: 50,
        branch: {
          id: 1,
          name: 'Sede Principal',
          address: 'Calle 123 # 45-67',
          latitude: '4.7110',
          longitude: '-74.0721',
          allowedRadius: 50,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async validateLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ValidateLocationDto,
  ) {
    return this.attendanceService.validateEmployeeLocation(
      user.employeeId,
      dto,
    );
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar asistencia',
    description:
      'Registra la asistencia del empleado autenticado. Valida ubicación y evita duplicados del mismo tipo hoy.',
  })
  @ApiBody({ type: RegisterAttendanceDto })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Asistencia de entrada registrada exitosamente',
        distance: 12,
        checkType: 'ENTRY',
        attendanceId: 123,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o registro duplicado',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Fuera del área permitida' })
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterAttendanceDto,
    @Req() req: RequestWithIp,
  ) {
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

  @Get('today')
  @ApiOperation({
    summary: 'Asistencias de hoy',
    description:
      'Obtiene todos los registros de asistencia del empleado autenticado para el día actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros del día',
    schema: {
      example: [
        {
          id: 123,
          employeeId: 1,
          branchId: 1,
          checkType: 'ENTRY',
          latitude: '4.7110',
          longitude: '-74.0721',
          accuracy: 15.5,
          distance: 12.3,
          ip: '192.168.1.1',
          device: 'Chrome/Windows',
          createdAt: '2026-07-07T08:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getToday(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getTodayAttendance(user.employeeId);
  }

  @Get('history/employee')
  @ApiOperation({
    summary: 'Historial de asistencia',
    description:
      'Obtiene el historial de registros del empleado autenticado con paginación y filtros.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'],
    description: 'Filtrar por tipo de registro',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt', 'checkType', 'distance'],
    description: 'Campo por el cual ordenar',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Dirección del orden',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial paginado',
    schema: {
      example: {
        records: [],
        total: 100,
        limit: 50,
        offset: 0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getHistory(user.employeeId, query);
  }

  @Get('can-register/:type')
  @ApiOperation({
    summary: 'Verificar si puede registrar',
    description:
      'Retorna si el empleado ya registró el tipo de asistencia indicado hoy.',
  })
  @ApiParam({
    name: 'type',
    enum: ['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'],
    description: 'Tipo de registro a verificar',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de verificación',
    schema: {
      example: {
        canRegister: true,
        alreadyRegistered: false,
        type: 'ENTRY',
        message: 'Puedes registrar entrada',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async canRegister(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type') type: string,
  ) {
    return this.attendanceService.canRegister(user.employeeId, type);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de asistencia del empleado',
    description:
      'Retorna estadísticas de totales, entradas, salidas, breaks, etc. para el empleado autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del empleado',
    schema: {
      example: {
        total: 45,
        entries: 30,
        exits: 15,
        breaks: 0,
        todayCount: 1,
        weekCount: 5,
        monthCount: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.getStats(user.employeeId);
  }

  @Get('stats/comparative')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Estadísticas comparativas (hoy vs ayer)',
    description:
      'Retorna comparativa de presentes, pendientes y llegadas tarde. Requiere rol admin o manager.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparativa de asistencia',
    schema: {
      example: {
        present: { today: 187, yesterday: 165 },
        pending: { today: 24, yesterday: 46 },
        late: { today: 9, yesterday: 12 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (admin/manager requerido)',
  })
  async getComparativeStats() {
    return this.attendanceService.getAttendanceStats();
  }

  // ============================================================
  // ADMIN ENDPOINTS
  // ============================================================

  @Get('admin')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: '[Admin] Listar todos los registros de asistencia',
    description:
      'Obtiene todos los registros con filtros y paginación. Solo admin/manager.',
  })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'],
  })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de todos los registros',
    schema: {
      example: {
        records: [],
        total: 200,
        limit: 50,
        offset: 0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos (admin/manager requerido)',
  })
  async getAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.getHistory(query.employeeId || 0, query);
  }

  @Get('admin/:id')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: '[Admin] Obtener registro por ID con relaciones',
    description:
      'Retorna un registro de asistencia con datos del empleado y sucursal.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del registro de asistencia',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado con relaciones',
    schema: {
      example: {
        record: {
          id: 123,
          employeeId: 1,
          branchId: 1,
          checkType: 'ENTRY',
          latitude: '4.7110',
          longitude: '-74.0721',
          accuracy: 15.5,
          distance: 12.3,
          ip: '192.168.1.1',
          device: 'Chrome/Windows',
          createdAt: '2026-07-07T08:00:00.000Z',
        },
        employee: {
          id: 1,
          code: 'EMP-001',
          fullName: 'Ana Martínez',
          email: 'ana@example.com',
        },
        branch: {
          id: 1,
          name: 'Sede Principal',
          address: 'Calle 123',
          latitude: '4.7110',
          longitude: '-74.0721',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findByIdWithRelations(id);
  }

  @Put('admin/:id')
  @Roles('admin')
  @ApiOperation({
    summary: '[Admin] Actualizar registro de asistencia',
    description: 'Actualiza los campos de un registro existente. Solo admin.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del registro a actualizar',
  })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    schema: {
      example: {
        id: 123,
        checkType: 'ENTRY',
        employeeId: 1,
        branchId: 1,
        latitude: '4.7110',
        longitude: '-74.0721',
        accuracy: 12.0,
        distance: 10.5,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (admin requerido)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete('admin/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[Admin] Eliminar registro de asistencia',
    description:
      'Elimina un registro de asistencia de forma permanente. Solo admin.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del registro a eliminar',
  })
  @ApiResponse({ status: 204, description: 'Eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (admin requerido)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.attendanceService.delete(id);
  }
}
