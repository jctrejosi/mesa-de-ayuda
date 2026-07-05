import { Injectable } from '@nestjs/common';
import { getDb } from '../../database/drizzle';
import {
  attendance,
  employee,
  branch,
  company,
  department,
  person,
} from '../../database/schema';
import { eq, and, gte, sql, desc, between } from 'drizzle-orm';

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

@Injectable()
export class DashboardService {
  private get db() {
    return getDb();
  }

  /**
   * Obtiene estadísticas generales del dashboard
   */
  async getStats(): Promise<DashboardStats> {
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

    // Total de empleados
    const totalEmployeesResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(employee);

    // Empleados activos
    const activeEmployeesResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(employee)
      .where(eq(employee.status, 'ACTIVE'));

    // Total de empresas
    const totalCompaniesResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(company)
      .where(eq(company.active, true));

    // Total de sucursales
    const totalBranchesResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(branch)
      .where(eq(branch.active, true));

    // Asistencias de hoy
    const todayAttendance = await this.db
      .select({
        employeeId: attendance.employeeId,
        checkType: attendance.checkType,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .where(between(attendance.createdAt, startOfDay, endOfDay));

    // Empleados que han registrado entrada hoy
    const uniqueEmployeesToday = new Set(
      todayAttendance
        .filter((a) => a.checkType === 'ENTRY')
        .map((a) => a.employeeId),
    );

    // Tardanzas (después de las 8:30 AM)
    const lateThreshold = new Date(today);
    lateThreshold.setHours(8, 30, 0, 0);

    const lateToday = todayAttendance.filter(
      (a) =>
        a.checkType === 'ENTRY' &&
        a.createdAt &&
        new Date(a.createdAt) > lateThreshold,
    );

    const totalEmployees = Number(totalEmployeesResult[0]?.count || 0);
    const activeEmployees = Number(activeEmployeesResult[0]?.count || 0);
    const presentToday = uniqueEmployeesToday.size;
    const absentToday = Math.max(0, activeEmployees - presentToday);

    return {
      totalEmployees,
      activeEmployees,
      presentToday,
      absentToday,
      lateToday: lateToday.length,
      attendanceRate:
        activeEmployees > 0 ? (presentToday / activeEmployees) * 100 : 0,
      totalCompanies: Number(totalCompaniesResult[0]?.count || 0),
      totalBranches: Number(totalBranchesResult[0]?.count || 0),
    };
  }

  /**
   * Obtiene datos para el gráfico de asistencia (últimos 7 días)
   */
  async getAttendanceChart(days: number = 7): Promise<AttendanceChartData[]> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await this.db
      .select({
        date: sql<string>`DATE(${attendance.createdAt})`,
        checkType: attendance.checkType,
        count: sql<number>`COUNT(*)`,
      })
      .from(attendance)
      .where(gte(attendance.createdAt, startDate))
      .groupBy(sql`DATE(${attendance.createdAt})`, attendance.checkType)
      .orderBy(sql`DATE(${attendance.createdAt})`);

    // Agrupar por fecha
    const dateMap = new Map<string, { entries: number; exits: number }>();

    for (const record of records) {
      if (!record.date) continue;

      const existing = dateMap.get(record.date) || { entries: 0, exits: 0 };

      if (record.checkType === 'ENTRY') {
        existing.entries += Number(record.count || 0);
      } else if (record.checkType === 'EXIT') {
        existing.exits += Number(record.count || 0);
      }

      dateMap.set(record.date, existing);
    }

    // Rellenar días faltantes
    const result: AttendanceChartData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = dateMap.get(dateStr) || { entries: 0, exits: 0 };

      result.push({
        date: dateStr,
        entries: data.entries,
        exits: data.exits,
        total: data.entries + data.exits,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Obtiene los registros de asistencia más recientes
   */
  async getRecentAttendance(limit: number = 10): Promise<RecentAttendance[]> {
    const records = await this.db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        employeeName: sql<string>`CONCAT(${person.firstName}, ' ', ${person.lastName})`,
        employeeCode: employee.employeeCode,
        checkType: attendance.checkType,
        createdAt: attendance.createdAt,
        distance: attendance.distance,
        branchName: branch.name,
      })
      .from(attendance)
      .leftJoin(employee, eq(attendance.employeeId, employee.id))
      .leftJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(attendance.branchId, branch.id))
      .orderBy(desc(attendance.createdAt))
      .limit(limit);

    return records.map((r) => ({
      id: r.id,
      employeeName: r.employeeName || 'Usuario desconocido',
      employeeCode: r.employeeCode,
      checkType: r.checkType,
      time: r.createdAt
        ? new Date(r.createdAt).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : '',
      distance: r.distance ? Math.round(Number(r.distance)) : null,
      branchName: r.branchName || 'Sin sucursal',
    }));
  }

  /**
   * Obtiene estadísticas por departamento
   */
  async getDepartmentStats(): Promise<DepartmentStats[]> {
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

    // ============================================================
    // CONSULTA ÚNICA CON SUBQUERY PARA ASISTENCIAS
    // ============================================================
    const results = await this.db
      .select({
        departmentName: sql<string>`COALESCE(${department.name}, 'Sin Departamento')`,
        total: sql<number>`COUNT(${employee.id})`,
        present: sql<number>`SUM(
        CASE WHEN ${attendance.id} IS NOT NULL AND ${attendance.checkType} = 'ENTRY' 
        THEN 1 ELSE 0 END
      )`,
      })
      .from(employee)
      .leftJoin(department, eq(employee.departmentId, department.id))
      .leftJoin(
        attendance,
        and(
          eq(attendance.employeeId, employee.id),
          between(attendance.createdAt, startOfDay, endOfDay),
          eq(attendance.checkType, 'ENTRY'),
        ),
      )
      .where(eq(employee.status, 'ACTIVE'))
      .groupBy(employee.departmentId);

    // ============================================================
    // CONSTRUIR RESULTADO
    // ============================================================
    return results.map((row) => ({
      department: row.departmentName || 'Sin Departamento',
      total: Number(row.total || 0),
      present: Number(row.present || 0),
      absent: Number(row.total || 0) - Number(row.present || 0),
      rate:
        Number(row.total || 0) > 0
          ? (Number(row.present || 0) / Number(row.total || 0)) * 100
          : 0,
    }));
  }

  /**
   * Obtiene el resumen diario de asistencia (últimos 7 días)
   */
  async getDailySummary(days: number = 7): Promise<DailySummary[]> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await this.db
      .select({
        date: sql<string>`DATE(${attendance.createdAt})`,
        checkType: attendance.checkType,
        count: sql<number>`COUNT(*)`,
      })
      .from(attendance)
      .where(gte(attendance.createdAt, startDate))
      .groupBy(sql`DATE(${attendance.createdAt})`, attendance.checkType)
      .orderBy(desc(sql`DATE(${attendance.createdAt})`));

    // Agrupar por fecha
    const dateMap = new Map<
      string,
      { entries: number; exits: number; total: number; late: number }
    >();

    // Para contar tardanzas, necesitamos los registros de entrada con hora
    const entryRecords = await this.db
      .select({
        date: sql<string>`DATE(${attendance.createdAt})`,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.createdAt, startDate),
          eq(attendance.checkType, 'ENTRY'),
        ),
      );

    const lateThreshold = new Date(today);
    lateThreshold.setHours(8, 30, 0, 0);

    for (const record of records) {
      if (!record.date) continue;

      const existing = dateMap.get(record.date) || {
        entries: 0,
        exits: 0,
        total: 0,
        late: 0,
      };
      const count = Number(record.count || 0);

      if (record.checkType === 'ENTRY') {
        existing.entries += count;
      } else if (record.checkType === 'EXIT') {
        existing.exits += count;
      }

      existing.total = existing.entries + existing.exits;
      dateMap.set(record.date, existing);
    }

    // Contar tardanzas por día
    for (const entry of entryRecords) {
      if (!entry.date || !entry.createdAt) continue;

      const dateStr = entry.date;
      const existing = dateMap.get(dateStr);

      if (existing) {
        const entryTime = new Date(entry.createdAt);
        const threshold = new Date(entryTime);
        threshold.setHours(8, 30, 0, 0);

        if (entryTime > threshold) {
          existing.late += 1;
          dateMap.set(dateStr, existing);
        }
      }
    }

    // Convertir a array
    const result: DailySummary[] = [];

    for (const [date, data] of dateMap) {
      result.push({
        date,
        total: data.total,
        entries: data.entries,
        exits: data.exits,
        late: data.late,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Obtiene el top de empleados más puntuales
   */
  async getTopPunctualEmployees(limit: number = 5): Promise<
    {
      employeeId: number;
      employeeName: string;
      employeeCode: string | null;
      onTimeCount: number;
      lateCount: number;
      punctualityRate: number;
    }[]
  > {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Últimos 30 días
    startDate.setHours(0, 0, 0, 0);

    // Obtener todos los registros de entrada
    const entryRecords = await this.db
      .select({
        employeeId: attendance.employeeId,
        employeeName: sql<string>`CONCAT(${person.firstName}, ' ', ${person.lastName})`,
        employeeCode: employee.employeeCode,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .leftJoin(employee, eq(attendance.employeeId, employee.id))
      .leftJoin(person, eq(employee.personId, person.id))
      .where(
        and(
          gte(attendance.createdAt, startDate),
          eq(attendance.checkType, 'ENTRY'),
        ),
      );

    // Agrupar por empleado
    const employeeMap = new Map<
      number,
      { name: string; code: string | null; entries: Date[] }
    >();

    for (const record of entryRecords) {
      if (!record.employeeId || !record.createdAt) continue;

      if (!employeeMap.has(record.employeeId)) {
        employeeMap.set(record.employeeId, {
          name: record.employeeName || 'Usuario desconocido',
          code: record.employeeCode,
          entries: [],
        });
      }

      employeeMap
        .get(record.employeeId)!
        .entries.push(new Date(record.createdAt));
    }

    // Calcular puntualidad
    const result: {
      employeeId: number;
      employeeName: string;
      employeeCode: string | null;
      onTimeCount: number;
      lateCount: number;
      punctualityRate: number;
    }[] = [];

    for (const [id, data] of employeeMap) {
      let onTime = 0;
      let late = 0;

      for (const entryTime of data.entries) {
        const threshold = new Date(entryTime);
        threshold.setHours(8, 30, 0, 0);

        if (entryTime <= threshold) {
          onTime++;
        } else {
          late++;
        }
      }

      const total = onTime + late;
      if (total === 0) continue;

      result.push({
        employeeId: id,
        employeeName: data.name,
        employeeCode: data.code,
        onTimeCount: onTime,
        lateCount: late,
        punctualityRate: (onTime / total) * 100,
      });
    }

    return result
      .sort((a, b) => b.punctualityRate - a.punctualityRate)
      .slice(0, limit);
  }
}
