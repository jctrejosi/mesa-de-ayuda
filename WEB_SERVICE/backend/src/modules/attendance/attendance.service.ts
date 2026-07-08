import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDb } from '../../database/drizzle';
import {
  attendance,
  employee,
  branch,
  person,
  type Attendance,
  type NewAttendance,
} from '../../database/schema';
import { eq, and, between, desc, asc, sql, gte, lte, or } from 'drizzle-orm';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  AttendanceValidationResult,
  AttendanceStats,
} from './interfaces/attendance.interface';
import { calculateDistance } from '../../utils/geolocation';
import { createContextLogger } from '../../utils/logger';
import { ValidateLocationDto } from './dto/validate-location.dto';
import { AttendanceStatsDto } from './dto/attendance-stats.dto';
import { AttendanceHistoryQueryDto } from './dto/attendance-history-query.dto';
import {
  AttendanceHistoryRecordDto,
  AttendanceHistoryResponseDto,
} from './dto/attendance-history-response.dto';

type AttendanceCheckType = 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

// Tipo para las condiciones de Drizzle
type DrizzleCondition = ReturnType<typeof eq> | ReturnType<typeof and>;

@Injectable()
export class AttendanceService {
  private readonly logger = createContextLogger('AttendanceService');

  constructor(private readonly configService: ConfigService) {}

  private get db() {
    return getDb();
  }

  /**
   * Registra una nueva asistencia
   */
  async register(
    employeeId: number,
    dto: RegisterAttendanceDto,
    ip: string,
    userAgent: string,
  ): Promise<{
    success: boolean;
    message: string;
    distance?: number;
    checkType: AttendanceCheckType;
    attendanceId?: number;
  }> {
    // 1. Verificar que el empleado existe y está activo
    const employeeData = await this.validateEmployee(employeeId);

    if (!employeeData.branchId) {
      throw new BadRequestException(
        'El empleado no tiene una sucursal asignada',
      );
    }

    // 2. Obtener la sucursal
    const branchData = await this.validateBranch(employeeData.branchId);

    // 3. Validar ubicación si se enviaron coordenadas
    let distance: number | undefined;
    let isWithinRadius = true;

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      const validation = this.validateLocation(
        dto.latitude,
        dto.longitude,
        branchData.latitude,
        branchData.longitude,
        branchData.allowedRadius,
      );

      isWithinRadius = validation.isWithinRadius;
      distance = validation.distance;

      if (!isWithinRadius) {
        throw new ForbiddenException({
          message: 'Fuera del área permitida',
          distance: Math.round(distance || 0),
          maxRadius: branchData.allowedRadius || 50,
          latitude: dto.latitude,
          longitude: dto.longitude,
        });
      }
    }

    // 4. Verificar si requiere geolocalización
    if (
      branchData.requireGeolocation &&
      (dto.latitude === undefined || dto.longitude === undefined)
    ) {
      throw new BadRequestException(
        'Esta sucursal requiere geolocalización para registrar asistencia',
      );
    }

    // 5. Verificar que no tenga un registro duplicado del mismo tipo hoy
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const existing = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          eq(attendance.checkType, dto.checkType),
          between(attendance.createdAt, startOfDay, endOfDay),
        ),
      );

    if (existing.length > 0) {
      throw new BadRequestException(
        `Ya registraste ${this.getCheckTypeLabel(dto.checkType).toLowerCase()} hoy`,
      );
    }

    // 6. Crear el registro
    const newAttendance: NewAttendance = {
      employeeId,
      branchId: branchData.id,
      checkType: dto.checkType,
      latitude: dto.latitude !== undefined ? String(dto.latitude) : null,
      longitude: dto.longitude !== undefined ? String(dto.longitude) : null,
      accuracy: dto.accuracy ?? null,
      distance: distance ?? null,
      ip: ip,
      device: userAgent,
    };

    const result = await this.db.insert(attendance).values(newAttendance);
    const insertId = Number(result[0]?.insertId || 0);

    this.logger.info(
      `Asistencia registrada: ${dto.checkType} para empleado ${employeeId} (ID: ${insertId})`,
    );

    return {
      success: true,
      message: `Asistencia de ${this.getCheckTypeLabel(dto.checkType).toLowerCase()} registrada exitosamente`,
      distance: distance ? Math.round(distance) : undefined,
      checkType: dto.checkType,
      attendanceId: insertId,
    };
  }

  /**
   * Obtiene la asistencia de hoy para un empleado
   */
  async getTodayAttendance(employeeId: number): Promise<Attendance[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const records = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          between(attendance.createdAt, startOfDay, endOfDay),
        ),
      )
      .orderBy(desc(attendance.createdAt));

    return records;
  }

  /**
   * Obtiene el historial de asistencia con paginación
   */
  async getHistory(
    employeeId: number,
    query: QueryAttendanceDto,
  ): Promise<{
    records: Attendance[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const conditions: DrizzleCondition[] = [];

    if (employeeId > 0) {
      conditions.push(eq(attendance.employeeId, employeeId));
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      conditions.push(gte(attendance.createdAt, startDate));
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(attendance.createdAt, endDate));
    }

    if (query.type) {
      conditions.push(eq(attendance.checkType, query.type));
    }

    if (query.branchId) {
      conditions.push(eq(attendance.branchId, query.branchId));
    }

    const orderByField =
      query.orderBy === 'createdAt'
        ? attendance.createdAt
        : query.orderBy === 'checkType'
          ? attendance.checkType
          : query.orderBy === 'distance'
            ? attendance.distance
            : attendance.createdAt;

    const orderDirection = query.orderDirection === 'ASC' ? asc : desc;

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const records = await this.db
      .select()
      .from(attendance)
      .where(whereClause)
      .orderBy(orderDirection(orderByField))
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0);

    const totalResult = await this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(attendance)
      .where(whereClause);

    return {
      records,
      total: Number(totalResult[0]?.total || 0),
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    };
  }

  /**
   * Obtiene un registro de asistencia por ID
   */
  async findById(id: number): Promise<Attendance | null> {
    const results = await this.db
      .select()
      .from(attendance)
      .where(eq(attendance.id, id))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Obtiene un registro de asistencia con relaciones
   */
  async findByIdWithRelations(id: number): Promise<{
    record: Attendance;
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
  } | null> {
    const results = await this.db
      .select({
        record: attendance,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        personFirstName: person.firstName,
        personMiddleName: person.middleName,
        personLastName: person.lastName,
        personSecondLastName: person.secondLastName,
        branchId: branch.id,
        branchName: branch.name,
        branchAddress: branch.address,
        branchLatitude: branch.latitude,
        branchLongitude: branch.longitude,
      })
      .from(attendance)
      .leftJoin(employee, eq(attendance.employeeId, employee.id))
      .leftJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(attendance.branchId, branch.id))
      .where(eq(attendance.id, id))
      .limit(1);

    if (!results.length) {
      return null;
    }

    const row = results[0];

    const fullName = [
      row.personFirstName,
      row.personMiddleName,
      row.personLastName,
      row.personSecondLastName,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      record: row.record,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            code: row.employeeCode,
            fullName: fullName || 'Sin nombre',
          }
        : undefined,
      branch: row.branchId
        ? {
            id: row.branchId,
            name: row.branchName || 'Sin nombre',
            address: row.branchAddress,
            latitude: row.branchLatitude,
            longitude: row.branchLongitude,
          }
        : undefined,
    };
  }

  /**
   * Actualiza un registro de asistencia (solo admin)
   */
  async update(id: number, dto: UpdateAttendanceDto): Promise<Attendance> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(
        `Registro de asistencia con ID ${id} no encontrado`,
      );
    }

    const updateData: Partial<NewAttendance> = {};

    if (dto.checkType) updateData.checkType = dto.checkType;
    if (dto.latitude !== undefined) updateData.latitude = String(dto.latitude);
    if (dto.longitude !== undefined)
      updateData.longitude = String(dto.longitude);
    if (dto.accuracy !== undefined) updateData.accuracy = dto.accuracy;
    if (dto.distance !== undefined) updateData.distance = dto.distance;
    if (dto.ip) updateData.ip = dto.ip;
    if (dto.device) updateData.device = dto.device;
    if (dto.branchId) updateData.branchId = dto.branchId;

    await this.db
      .update(attendance)
      .set(updateData)
      .where(eq(attendance.id, id));

    const updated = await this.findById(id);
    return updated!;
  }

  /**
   * Elimina un registro de asistencia (solo admin)
   */
  async delete(id: number): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(
        `Registro de asistencia con ID ${id} no encontrado`,
      );
    }

    await this.db.delete(attendance).where(eq(attendance.id, id));

    this.logger.info(`Registro de asistencia eliminado: ID ${id}`);
    return true;
  }

  /**
   * Obtiene estadísticas de asistencia para un empleado
   */
  async getStats(employeeId: number): Promise<AttendanceStats> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const allRecords = await this.db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId));

    const todayRecords = allRecords.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= startOfDay,
    );

    const weekRecords = allRecords.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= startOfWeek,
    );

    const monthRecords = allRecords.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= startOfMonth,
    );

    return {
      total: allRecords.length,
      entries: allRecords.filter((r) => r.checkType === 'ENTRY').length,
      exits: allRecords.filter((r) => r.checkType === 'EXIT').length,
      breaks: allRecords.filter(
        (r) => r.checkType === 'BREAK_START' || r.checkType === 'BREAK_END',
      ).length,
      todayCount: todayRecords.length,
      weekCount: weekRecords.length,
      monthCount: monthRecords.length,
    };
  }

  /**
   * Obtiene historial avanzado con todos los datos, paginación y filtros.
   * Calcula el estado (approved, late, rejected) en base a distancia y hora.
   */
  async getAttendanceHistory(
    query: AttendanceHistoryQueryDto,
  ): Promise<AttendanceHistoryResponseDto> {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      type,
      status,
      search,
    } = query;
    const offset = (page - 1) * limit;

    // 1. Construir condiciones
    const conditions: DrizzleCondition[] = [];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(attendance.createdAt, start));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(attendance.createdAt, end));
    }
    if (type) {
      conditions.push(eq(attendance.checkType, type));
    }
    // El estado se calcula, no se puede filtrar directamente en SQL, lo haremos después

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${person.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${person.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(${employee.employeeCode}) LIKE ${searchTerm}`,
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 2. Consulta principal con JOIN
    const rawRecords = await this.db
      .select({
        id: attendance.id,
        checkType: attendance.checkType,
        createdAt: attendance.createdAt,
        distance: attendance.distance,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
        accuracy: attendance.accuracy,
        branchName: branch.name,
        branchAddress: branch.address,
        branchAllowedRadius: branch.allowedRadius,
        employeeCode: employee.employeeCode,
        photo: person.photo,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        secondLastName: person.secondLastName,
      })
      .from(attendance)
      .leftJoin(employee, eq(attendance.employeeId, employee.id))
      .leftJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(attendance.branchId, branch.id))
      .where(whereClause)
      .orderBy(desc(attendance.createdAt))
      .limit(limit)
      .offset(offset);

    // 3. Contar total (sin paginación)
    const countResult = await this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(attendance)
      .leftJoin(employee, eq(attendance.employeeId, employee.id))
      .leftJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(attendance.branchId, branch.id))
      .where(whereClause);
    const total = Number(countResult[0]?.total || 0);

    // 4. Mapear y calcular estado
    const records: AttendanceHistoryRecordDto[] = rawRecords.map((row) => {
      const status = this.calculateStatus(row);
      const fullName = [
        row.firstName,
        row.middleName,
        row.lastName,
        row.secondLastName,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: row.id,
        employee: {
          code: row.employeeCode || '---',
          fullName: fullName || 'Sin nombre',
          photo: row.photo || null,
        },
        date: row.createdAt ? row.createdAt.toISOString().split('T')[0] : '',
        time: row.createdAt ? row.createdAt.toTimeString().slice(0, 5) : '',
        type: row.checkType,
        status,
        distance: row.distance ? Math.round(row.distance) : null,
        branch: {
          name: row.branchName || 'Sin sucursal',
          address: row.branchAddress || null,
        },
        createdAt: row.createdAt ? row.createdAt.toISOString() : '',
      };
    });

    // 5. Filtrar por estado (porque se calcula en memoria)
    let filteredRecords = records;
    if (status) {
      const statusFilter =
        status === 'approved'
          ? 'APPROVED'
          : status === 'late'
            ? 'LATE'
            : 'REJECTED_LOCATION';

      filteredRecords = records.filter((r) => r.status === statusFilter);
    }

    // Nota: el total sigue siendo el total sin filtrar por estado, pero podríamos
    // recalcular el total en base a los filtrados si es necesario.
    // Para simplificar, devolvemos el total original y el frontend usará
    // el length de filteredRecords para saber cuántos hay en esta página.

    return {
      records: filteredRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Calcula el estado de un registro basado en distancia y hora.
   */
  private calculateStatus(row: {
    distance: number | null;
    branchAllowedRadius: number | null;
    checkType: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';
    createdAt: Date | null;
  }): 'APPROVED' | 'LATE' | 'REJECTED_LOCATION' {
    // Rechazado: distancia mayor al radio permitido
    if (
      row.distance !== null &&
      row.branchAllowedRadius !== null &&
      row.distance > row.branchAllowedRadius
    ) {
      return 'REJECTED_LOCATION';
    }

    // Tarde: solo aplica para entradas
    if (row.checkType === 'ENTRY' && row.createdAt) {
      const hours = row.createdAt.getHours();
      const minutes = row.createdAt.getMinutes();

      if (hours > 8 || (hours === 8 && minutes > 30)) {
        return 'LATE';
      }
    }

    return 'APPROVED';
  }

  /**
   * Obtiene estadísticas comparativas de asistencia (hoy vs ayer)
   */
  async getAttendanceStats(): Promise<AttendanceStatsDto> {
    const today = new Date();

    // Hoy
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const yesterdayEnd = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate() + 1,
    );

    // 1. Obtener todos los empleados activos
    const activeEmployees = await this.db
      .select({ id: employee.id })
      .from(employee)
      .where(eq(employee.status, 'ACTIVE'));

    const totalActive = activeEmployees.length;

    // 2. Asistencias de hoy (ENTRY)
    const todayEntries = await this.db
      .select({
        employeeId: attendance.employeeId,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.checkType, 'ENTRY'),
          between(attendance.createdAt, todayStart, todayEnd),
        ),
      )
      .groupBy(attendance.employeeId);

    // 3. Asistencias de ayer (ENTRY)
    const yesterdayEntries = await this.db
      .select({
        employeeId: attendance.employeeId,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.checkType, 'ENTRY'),
          between(attendance.createdAt, yesterdayStart, yesterdayEnd),
        ),
      )
      .groupBy(attendance.employeeId);

    // 4. Tardanzas de hoy (ENTRY después de las 8:30 AM)
    const lateThreshold = new Date(today);
    lateThreshold.setHours(8, 30, 0, 0);

    const todayLate = await this.db
      .select({
        employeeId: attendance.employeeId,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.checkType, 'ENTRY'),
          gte(attendance.createdAt, lateThreshold),
          lte(attendance.createdAt, todayEnd),
        ),
      )
      .groupBy(attendance.employeeId);

    // 5. Tardanzas de ayer (ENTRY después de las 8:30 AM)
    const yesterdayLateThreshold = new Date(yesterday);
    yesterdayLateThreshold.setHours(8, 30, 0, 0);

    const yesterdayLate = await this.db
      .select({
        employeeId: attendance.employeeId,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.checkType, 'ENTRY'),
          gte(attendance.createdAt, yesterdayLateThreshold),
          lte(attendance.createdAt, yesterdayEnd),
        ),
      )
      .groupBy(attendance.employeeId);

    const presentToday = todayEntries.length;
    const presentYesterday = yesterdayEntries.length;
    const lateToday = todayLate.length;
    const lateYesterday = yesterdayLate.length;

    return {
      present: {
        today: presentToday,
        yesterday: presentYesterday,
      },
      pending: {
        today: Math.max(0, totalActive - presentToday),
        yesterday: Math.max(0, totalActive - presentYesterday),
      },
      late: {
        today: lateToday,
        yesterday: lateYesterday,
      },
    };
  }

  /**
   * Verifica si un empleado puede registrar hoy
   */
  async canRegister(
    employeeId: number,
    type: string,
  ): Promise<{
    canRegister: boolean;
    alreadyRegistered: boolean;
    type: string;
    message?: string;
  }> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const existing = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          eq(attendance.checkType, type as AttendanceCheckType),
          between(attendance.createdAt, startOfDay, endOfDay),
        ),
      );

    return {
      canRegister: existing.length === 0,
      alreadyRegistered: existing.length > 0,
      type,
      message:
        existing.length > 0
          ? `Ya registraste ${this.getCheckTypeLabel(type).toLowerCase()} hoy`
          : `Puedes registrar ${this.getCheckTypeLabel(type).toLowerCase()}`,
    };
  }

  /**
   * Valida la ubicación del empleado (método público)
   * Usa el método privado validateLocation que ya existe
   */
  async validateEmployeeLocation(
    employeeId: number,
    dto: ValidateLocationDto,
  ): Promise<{
    isValid: boolean;
    message: string;
    distance: number;
    maxRadius: number;
    branch: {
      id: number;
      name: string;
      address: string | null;
      latitude: string;
      longitude: string;
      allowedRadius: number;
    } | null;
  }> {
    // 1. Validar empleado
    const employeeData = await this.validateEmployee(employeeId);

    if (!employeeData.branchId) {
      throw new BadRequestException(
        'El empleado no tiene una sucursal asignada',
      );
    }

    // 2. Validar sucursal
    const branchData = await this.validateBranch(employeeData.branchId);

    // 3. Usar el método privado validateLocation (NO lo tocas, sigue siendo private)
    const validation = this.validateLocation(
      dto.latitude,
      dto.longitude,
      branchData.latitude,
      branchData.longitude,
      branchData.allowedRadius,
    );

    // 4. Formatear respuesta
    return {
      isValid: validation.isWithinRadius,
      message:
        validation.message ||
        (validation.isWithinRadius
          ? 'Ubicación válida'
          : 'Fuera del área permitida'),
      distance: Math.round(validation.distance || 0),
      maxRadius: validation.maxRadius || branchData.allowedRadius || 50,
      branch: {
        id: branchData.id,
        name: branchData.name,
        address: branchData.address,
        latitude: branchData.latitude!,
        longitude: branchData.longitude!,
        allowedRadius: branchData.allowedRadius || 50,
      },
    };
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  /**
   * Valida que el empleado exista y esté activo
   */
  private async validateEmployee(employeeId: number) {
    const results = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, employeeId))
      .limit(1);

    if (!results.length) {
      throw new BadRequestException(
        `Empleado con ID ${employeeId} no encontrado`,
      );
    }

    const employeeData = results[0];

    if (employeeData.status !== 'ACTIVE') {
      throw new BadRequestException(
        `El empleado no está activo. Estado: ${employeeData.status}`,
      );
    }

    return employeeData;
  }

  /**
   * Valida que la sucursal exista y esté activa
   */
  private async validateBranch(branchId: number) {
    const results = await this.db
      .select()
      .from(branch)
      .where(eq(branch.id, branchId))
      .limit(1);

    if (!results.length) {
      throw new BadRequestException(
        `Sucursal con ID ${branchId} no encontrada`,
      );
    }

    const branchData = results[0];

    if (!branchData.active) {
      throw new BadRequestException('La sucursal no está activa');
    }

    return branchData;
  }

  /**
   * Valida la ubicación del empleado vs la sucursal
   */
  private validateLocation(
    latitude: number,
    longitude: number,
    branchLatitude: string | null,
    branchLongitude: string | null,
    allowedRadius: number | null,
  ): AttendanceValidationResult {
    if (!branchLatitude || !branchLongitude) {
      return {
        isValid: false,
        isWithinRadius: false,
        message: 'La sucursal no tiene coordenadas configuradas',
      };
    }

    const branchLat = parseFloat(branchLatitude);
    const branchLon = parseFloat(branchLongitude);

    if (isNaN(branchLat) || isNaN(branchLon)) {
      return {
        isValid: false,
        isWithinRadius: false,
        message: 'Coordenadas de la sucursal inválidas',
      };
    }

    const radius = allowedRadius || 50;
    const distance = calculateDistance(
      latitude,
      longitude,
      branchLat,
      branchLon,
    );
    const isWithin = distance <= radius;

    return {
      isValid: isWithin,
      distance,
      maxRadius: radius,
      isWithinRadius: isWithin,
      message: isWithin
        ? `Ubicación válida. Distancia: ${Math.round(distance)}m`
        : `Fuera del área permitida. Distancia: ${Math.round(distance)}m (máximo ${radius}m)`,
    };
  }

  /**
   * Obtiene el label legible del tipo de registro
   */
  private getCheckTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      ENTRY: 'Entrada',
      EXIT: 'Salida',
      BREAK_START: 'Inicio de descanso',
      BREAK_END: 'Fin de descanso',
    };
    return labels[type] || type;
  }
}
