import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db } from '../../database/drizzle';
import { attendance, branch, employee } from '../../database/schema';
import { eq, and, between, desc, sql } from 'drizzle-orm';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { calculateDistance, isWithinRadius } from '../../utils/geolocation';

@Injectable()
export class AttendanceService {
  async register(employeeId: number, dto: RegisterAttendanceDto) {
    // 1. Validar que el empleado existe
    const employees = await db
      .select()
      .from(employee)
      .where(eq(employee.id, employeeId))
      .limit(1);

    if (!employees.length) {
      throw new BadRequestException('Empleado no encontrado');
    }

    const employeeData = employees[0];

    // 2. Obtener la sucursal del empleado
    if (!employeeData.branchId) {
      throw new BadRequestException(
        'El empleado no tiene una sucursal asignada',
      );
    }

    const branches = await db
      .select()
      .from(branch)
      .where(eq(branch.id, employeeData.branchId))
      .limit(1);

    if (!branches.length) {
      throw new BadRequestException('Sucursal no encontrada');
    }

    const branchData = branches[0];

    // 3. Validar geolocalización
    if (dto.latitude && dto.longitude) {
      const distance = calculateDistance(
        Number(branchData.latitude),
        Number(branchData.longitude),
        dto.latitude,
        dto.longitude,
      );

      const radius = branchData.allowedRadius || 50;

      if (distance > radius) {
        throw new ForbiddenException(
          `Fuera del área permitida. Distancia: ${Math.round(distance)}m (máximo ${radius}m)`,
        );
      }

      // Guardar con la distancia calculada
      const newAttendance = await db.insert(attendance).values({
        employeeId,
        branchId: branchData.id,
        checkType: dto.checkType,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        distance: distance,
        ip: dto.ip,
        device: dto.device,
      });

      return {
        success: true,
        message: 'Asistencia registrada correctamente',
        distance: Math.round(distance),
        checkType: dto.checkType,
      };
    } else {
      // Registro sin GPS (manual)
      const newAttendance = await db.insert(attendance).values({
        employeeId,
        branchId: branchData.id,
        checkType: dto.checkType,
        ip: dto.ip,
        device: dto.device,
      });

      return {
        success: true,
        message: 'Asistencia registrada manualmente',
        checkType: dto.checkType,
      };
    }
  }

  async getTodayAttendance(employeeId: number) {
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

    const records = await db
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

  async getHistory(employeeId: number, query: QueryAttendanceDto) {
    const { startDate, endDate, limit = 50, offset = 0 } = query;

    const conditions = [eq(attendance.employeeId, employeeId)];

    if (startDate) {
      conditions.push(sql`${attendance.createdAt} >= ${new Date(startDate)}`);
    }
    if (endDate) {
      conditions.push(sql`${attendance.createdAt} <= ${new Date(endDate)}`);
    }

    const records = await db
      .select()
      .from(attendance)
      .where(and(...conditions))
      .orderBy(desc(attendance.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(and(...conditions));

    return {
      records,
      total: total[0]?.count || 0,
      limit,
      offset,
    };
  }

  async canRegister(employeeId: number, type: string) {
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

    // Verificar si ya registró hoy
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          eq(attendance.checkType, type as any),
          between(attendance.createdAt, startOfDay, endOfDay),
        ),
      );

    return {
      canRegister: existing.length === 0,
      alreadyRegistered: existing.length > 0,
      type,
    };
  }
}
