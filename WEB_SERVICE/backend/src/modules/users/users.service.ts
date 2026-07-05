import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { getDb } from '../../database/drizzle';
import {
  person,
  employee,
  account,
  branch,
  department,
  position,
  company,
  type Person,
  type NewPerson,
  type Employee,
  type NewEmployee,
  type Account,
  type NewAccount,
} from '../../database/schema';
import { eq, and, like, or, sql, desc } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CompanyService } from '../company/company.service';
import { createContextLogger } from '../../utils/logger';

export interface UserWithRelations {
  account: Account;
  employee: Employee;
  person: Person;
  branchName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  companyName?: string | null;
}

export interface UserListResponse {
  users: UserWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type DrizzleCondition = ReturnType<typeof eq> | ReturnType<typeof and>;

@Injectable()
export class UsersService {
  private readonly logger = createContextLogger('UsersService');
  private readonly bcryptSaltRounds = 10;

  constructor(
    // Removed unused configService property
    private readonly companyService: CompanyService,
  ) {}

  private get db() {
    return getDb();
  }

  // ============================================================
  // LISTAR USUARIOS
  // ============================================================

  async findAll(query: UserQueryDto): Promise<UserListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      branchId,
      departmentId,
      positionId,
    } = query;
    const offset = (page - 1) * limit;

    const conditions: DrizzleCondition[] = [];

    if (search) {
      conditions.push(
        or(
          like(person.firstName, `%${search}%`),
          like(person.lastName, `%${search}%`),
          like(employee.employeeCode, `%${search}%`),
          like(account.username, `%${search}%`),
        ),
      );
    }

    if (status) {
      conditions.push(eq(employee.status, status));
    }

    if (branchId) {
      conditions.push(eq(employee.branchId, branchId));
    }

    if (departmentId) {
      conditions.push(eq(employee.departmentId, departmentId));
    }

    if (positionId) {
      conditions.push(eq(employee.positionId, positionId));
    }

    // Solo usuarios activos por defecto
    conditions.push(eq(account.active, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const users = await this.db
      .select({
        account: account,
        employee: employee,
        person: person,
        branchName: branch.name,
        departmentName: department.name,
        positionName: position.name,
        companyName: company.name,
      })
      .from(account)
      .innerJoin(employee, eq(account.employeeId, employee.id))
      .innerJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(employee.branchId, branch.id))
      .leftJoin(department, eq(employee.departmentId, department.id))
      .leftJoin(position, eq(employee.positionId, position.id))
      .leftJoin(company, eq(branch.companyId, company.id))
      .where(whereClause)
      .orderBy(desc(account.createdAt))
      .limit(limit)
      .offset(offset);

    // Contar total
    const countResult = await this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(account)
      .innerJoin(employee, eq(account.employeeId, employee.id))
      .innerJoin(person, eq(employee.personId, person.id))
      .where(whereClause);

    const total = Number(countResult[0]?.total || 0);

    return {
      users: users.map((u) => ({
        account: u.account,
        employee: u.employee,
        person: u.person,
        branchName: u.branchName,
        departmentName: u.departmentName,
        positionName: u.positionName,
        companyName: u.companyName,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // OBTENER USUARIO POR ID
  // ============================================================

  async findById(accountId: number): Promise<UserWithRelations | null> {
    const results = await this.db
      .select({
        account: account,
        employee: employee,
        person: person,
        branchName: branch.name,
        departmentName: department.name,
        positionName: position.name,
        companyName: company.name,
      })
      .from(account)
      .innerJoin(employee, eq(account.employeeId, employee.id))
      .innerJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(employee.branchId, branch.id))
      .leftJoin(department, eq(employee.departmentId, department.id))
      .leftJoin(position, eq(employee.positionId, position.id))
      .leftJoin(company, eq(branch.companyId, company.id))
      .where(eq(account.id, accountId))
      .limit(1);

    if (!results.length) {
      return null;
    }

    const row = results[0];
    return {
      account: row.account,
      employee: row.employee,
      person: row.person,
      branchName: row.branchName,
      departmentName: row.departmentName,
      positionName: row.positionName,
      companyName: row.companyName,
    };
  }

  /**
   * Obtiene un usuario por su nombre de usuario
   */
  async findByUsername(username: string): Promise<UserWithRelations | null> {
    const results = await this.db
      .select({
        account: account,
        employee: employee,
        person: person,
        branchName: branch.name,
        departmentName: department.name,
        positionName: position.name,
        companyName: company.name,
      })
      .from(account)
      .innerJoin(employee, eq(account.employeeId, employee.id))
      .innerJoin(person, eq(employee.personId, person.id))
      .leftJoin(branch, eq(employee.branchId, branch.id))
      .leftJoin(department, eq(employee.departmentId, department.id))
      .leftJoin(position, eq(employee.positionId, position.id))
      .leftJoin(company, eq(branch.companyId, company.id))
      .where(eq(account.username, username))
      .limit(1);

    if (!results.length) {
      return null;
    }

    const row = results[0];
    return {
      account: row.account,
      employee: row.employee,
      person: row.person,
      branchName: row.branchName,
      departmentName: row.departmentName,
      positionName: row.positionName,
      companyName: row.companyName,
    };
  }

  // ============================================================
  // CREAR USUARIO (CON TRANSACCIÓN)
  // ============================================================

  // ============================================================
  // CREAR USUARIO (CON TRANSACCIÓN)
  // ============================================================

  async create(data: CreateUserDto): Promise<UserWithRelations> {
    // 1. Validar que el username no exista
    const existingAccount = await this.db
      .select()
      .from(account)
      .where(eq(account.username, data.username))
      .limit(1);

    if (existingAccount.length) {
      throw new ConflictException(`El usuario "${data.username}" ya existe`);
    }

    // 2. Validar que el documento no exista
    if (data.documentNumber) {
      const existingPerson = await this.db
        .select()
        .from(person)
        .where(eq(person.documentNumber, data.documentNumber))
        .limit(1);

      if (existingPerson.length) {
        throw new ConflictException(
          `La persona con documento "${data.documentNumber}" ya existe`,
        );
      }
    }

    // 3. Validar que el email no exista
    if (data.email) {
      const existingEmail = await this.db
        .select()
        .from(person)
        .where(eq(person.email, data.email))
        .limit(1);

      if (existingEmail.length) {
        throw new ConflictException(
          `El email "${data.email}" ya está registrado`,
        );
      }
    }

    // 4. Validar la consistencia de la empresa
    let companyId: number | null = null;

    if (data.branchId) {
      const branchExists = await this.companyService.findBranchById(
        data.branchId,
      );
      if (!branchExists) {
        throw new BadRequestException(
          `Sucursal con ID ${data.branchId} no encontrada`,
        );
      }
      companyId = branchExists.companyId;
    }

    if (data.departmentId) {
      const deptExists = await this.companyService.findDepartmentById(
        data.departmentId,
      );
      if (!deptExists) {
        throw new BadRequestException(
          `Departamento con ID ${data.departmentId} no encontrado`,
        );
      }
      if (companyId !== null && deptExists.companyId !== companyId) {
        throw new BadRequestException(
          'El departamento no pertenece a la misma empresa que la sucursal',
        );
      }
      if (companyId === null) {
        companyId = deptExists.companyId;
      }
    }

    if (data.positionId) {
      const posExists = await this.companyService.findPositionById(
        data.positionId,
      );
      if (!posExists) {
        throw new BadRequestException(
          `Cargo con ID ${data.positionId} no encontrado`,
        );
      }
      if (companyId !== null && posExists.companyId !== companyId) {
        throw new BadRequestException(
          'El cargo no pertenece a la misma empresa que la sucursal',
        );
      }
    }

    // ============================================================
    // TRANSACCIÓN: Crear persona, empleado y cuenta
    // ============================================================

    let personId: number = 0;
    let employeeId: number = 0;
    let accountId: number = 0;

    try {
      await this.db.transaction(async (tx) => {
        // 5. Crear la persona
        const newPerson: NewPerson = {
          documentType: data.documentType || null,
          documentNumber: data.documentNumber || null,
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
          secondLastName: data.secondLastName || null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          gender: data.gender || null,
          email: data.email || null,
          personalEmail: data.personalEmail || null,
          phone: data.phone || null,
          mobile: data.mobile || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          active: true,
        };

        const personResult = await tx.insert(person).values(newPerson);
        personId = Number(personResult[0]?.insertId || 0);

        if (!personId) {
          throw new BadRequestException('Error al crear la persona');
        }

        // 6. Crear el empleado
        const newEmployee: NewEmployee = {
          personId,
          employeeCode:
            data.employeeCode || `EMP-${String(personId).padStart(6, '0')}`,
          branchId: data.branchId || null,
          departmentId: data.departmentId || null,
          positionId: data.positionId || null,
          hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
          terminationDate: null,
          status: data.status || 'ACTIVE',
        };

        const employeeResult = await tx.insert(employee).values(newEmployee);
        employeeId = Number(employeeResult[0]?.insertId || 0);

        if (!employeeId) {
          throw new BadRequestException('Error al crear el empleado');
        }

        // 7. Crear la cuenta
        const hashedPassword = await bcrypt.hash(
          data.password,
          this.bcryptSaltRounds,
        );

        const newAccount: NewAccount = {
          employeeId,
          username: data.username,
          passwordHash: hashedPassword,
          role: data.role || 'employee',
          failedAttempts: 0,
          lockedUntil: null,
          lastLogin: null,
          active: data.active !== undefined ? data.active : true,
        };

        const accountResult = await tx.insert(account).values(newAccount);
        accountId = Number(accountResult[0]?.insertId || 0);

        if (!accountId) {
          throw new BadRequestException('Error al crear la cuenta');
        }
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Error en transacción de creación de usuario: ${message}`,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error al crear el usuario. Los datos han sido revertidos.',
      );
    }

    // 8. Verificar que el usuario se creó correctamente
    if (!accountId) {
      throw new BadRequestException('Error al crear el usuario');
    }

    // 9. Obtener el usuario completo
    const user = await this.findById(accountId);
    if (!user) {
      throw new BadRequestException('Error al recuperar el usuario creado');
    }

    this.logger.info(`Usuario creado: ${data.username} (ID: ${accountId})`);
    return user;
  }

  // ============================================================
  // ACTUALIZAR USUARIO (CON TRANSACCIÓN)
  // ============================================================

  async update(
    accountId: number,
    data: UpdateUserDto,
  ): Promise<UserWithRelations> {
    const existing = await this.findById(accountId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    // Construir los datos de actualización
    const personUpdate: Partial<NewPerson> = {};
    const employeeUpdate: Partial<NewEmployee> = {};
    const accountUpdate: Partial<NewAccount> = {};

    // 1. Preparar actualización de persona
    if (data.documentType !== undefined)
      personUpdate.documentType = data.documentType;
    if (data.documentNumber !== undefined)
      personUpdate.documentNumber = data.documentNumber;
    if (data.firstName !== undefined) personUpdate.firstName = data.firstName;
    if (data.middleName !== undefined)
      personUpdate.middleName = data.middleName;
    if (data.lastName !== undefined) personUpdate.lastName = data.lastName;
    if (data.secondLastName !== undefined)
      personUpdate.secondLastName = data.secondLastName;
    if (data.birthDate !== undefined)
      personUpdate.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.gender !== undefined) personUpdate.gender = data.gender;
    if (data.email !== undefined) personUpdate.email = data.email;
    if (data.personalEmail !== undefined)
      personUpdate.personalEmail = data.personalEmail;
    if (data.phone !== undefined) personUpdate.phone = data.phone;
    if (data.mobile !== undefined) personUpdate.mobile = data.mobile;
    if (data.address !== undefined) personUpdate.address = data.address;
    if (data.city !== undefined) personUpdate.city = data.city;
    if (data.state !== undefined) personUpdate.state = data.state;
    if (data.country !== undefined) personUpdate.country = data.country;

    // 2. Preparar actualización de empleado
    if (data.employeeCode !== undefined)
      employeeUpdate.employeeCode = data.employeeCode;
    if (data.branchId !== undefined) {
      if (data.branchId) {
        const branchExists = await this.companyService.findBranchById(
          data.branchId,
        );
        if (!branchExists) {
          throw new BadRequestException(
            `Sucursal con ID ${data.branchId} no encontrada`,
          );
        }
      }
      employeeUpdate.branchId = data.branchId;
    }
    if (data.departmentId !== undefined) {
      if (data.departmentId) {
        const deptExists = await this.companyService.findDepartmentById(
          data.departmentId,
        );
        if (!deptExists) {
          throw new BadRequestException(
            `Departamento con ID ${data.departmentId} no encontrado`,
          );
        }
      }
      employeeUpdate.departmentId = data.departmentId;
    }
    if (data.positionId !== undefined) {
      if (data.positionId) {
        const posExists = await this.companyService.findPositionById(
          data.positionId,
        );
        if (!posExists) {
          throw new BadRequestException(
            `Cargo con ID ${data.positionId} no encontrado`,
          );
        }
      }
      employeeUpdate.positionId = data.positionId;
    }
    if (data.hireDate !== undefined)
      employeeUpdate.hireDate = data.hireDate ? new Date(data.hireDate) : null;
    if (data.terminationDate !== undefined)
      employeeUpdate.terminationDate = data.terminationDate
        ? new Date(data.terminationDate)
        : null;
    if (data.status !== undefined) employeeUpdate.status = data.status;

    // 3. Preparar actualización de cuenta
    if (data.username !== undefined) {
      if (data.username !== existing.account.username) {
        const existingUsername = await this.db
          .select()
          .from(account)
          .where(
            and(eq(account.username, data.username), eq(account.id, accountId)),
          )
          .limit(1);

        if (existingUsername.length) {
          throw new ConflictException(
            `El usuario "${data.username}" ya existe`,
          );
        }
        accountUpdate.username = data.username;
      }
    }
    if (data.password !== undefined && data.password) {
      accountUpdate.passwordHash = await bcrypt.hash(
        data.password,
        this.bcryptSaltRounds,
      );
    }
    const accountData = data as UpdateUserDto & { role?: Account['role'] };
    if (accountData.role !== undefined) {
      accountUpdate.role = accountData.role;
    }
    if (data.active !== undefined) accountUpdate.active = data.active;

    // 4. Ejecutar actualizaciones en transacción
    const hasPersonUpdate = Object.keys(personUpdate).length > 0;
    const hasEmployeeUpdate = Object.keys(employeeUpdate).length > 0;
    const hasAccountUpdate = Object.keys(accountUpdate).length > 0;

    if (hasPersonUpdate || hasEmployeeUpdate || hasAccountUpdate) {
      try {
        await this.db.transaction(async (tx) => {
          if (hasPersonUpdate) {
            await tx
              .update(person)
              .set(personUpdate)
              .where(eq(person.id, existing.person.id));
          }

          if (hasEmployeeUpdate) {
            await tx
              .update(employee)
              .set(employeeUpdate)
              .where(eq(employee.id, existing.employee.id));
          }

          if (hasAccountUpdate) {
            await tx
              .update(account)
              .set(accountUpdate)
              .where(eq(account.id, accountId));
          }
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        this.logger.error(
          `Error en transacción de actualización de usuario: ${message}`,
        );
        if (
          error instanceof BadRequestException ||
          error instanceof ConflictException
        ) {
          throw error;
        }
        throw new BadRequestException('Error al actualizar el usuario');
      }
    }

    // 5. Obtener el usuario actualizado
    const updated = await this.findById(accountId);
    if (!updated) {
      throw new BadRequestException(
        'Error al recuperar el usuario actualizado',
      );
    }

    this.logger.info(
      `Usuario actualizado: ${updated.account.username} (ID: ${accountId})`,
    );
    return updated;
  }

  // ============================================================
  // ELIMINAR USUARIO (SOFT DELETE)
  // ============================================================

  async delete(accountId: number): Promise<boolean> {
    const existing = await this.findById(accountId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    // Desactivar cuenta en lugar de eliminar físicamente
    await this.db
      .update(account)
      .set({ active: false })
      .where(eq(account.id, accountId));

    this.logger.info(
      `Usuario desactivado: ${existing.account.username} (ID: ${accountId})`,
    );
    return true;
  }

  // ============================================================
  // ELIMINAR USUARIO FÍSICAMENTE (CON TRANSACCIÓN)
  // ============================================================

  async deletePermanently(accountId: number): Promise<boolean> {
    const existing = await this.findById(accountId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    try {
      await this.db.transaction(async (tx) => {
        // Eliminar en orden: account, employee, person
        await tx.delete(account).where(eq(account.id, accountId));
        await tx.delete(employee).where(eq(employee.id, existing.employee.id));
        await tx.delete(person).where(eq(person.id, existing.person.id));
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error eliminando usuario permanentemente: ${message}`);
      throw new BadRequestException('Error al eliminar el usuario');
    }

    this.logger.info(
      `Usuario eliminado permanentemente: ${existing.account.username} (ID: ${accountId})`,
    );
    return true;
  }

  // ============================================================
  // CAMBIAR ESTADO DEL USUARIO
  // ============================================================

  async toggleStatus(accountId: number): Promise<{ active: boolean }> {
    const existing = await this.findById(accountId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    const newStatus = !existing.account.active;
    await this.db
      .update(account)
      .set({ active: newStatus })
      .where(eq(account.id, accountId));

    this.logger.info(
      `Usuario ${newStatus ? 'activado' : 'desactivado'}: ${existing.account.username}`,
    );
    return { active: newStatus };
  }

  // ============================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================

  async changePassword(
    accountId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const existing = await this.findById(accountId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existing.account.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.bcryptSaltRounds,
    );
    await this.db
      .update(account)
      .set({ passwordHash: hashedPassword })
      .where(eq(account.id, accountId));

    this.logger.info(
      `Contraseña actualizada para usuario: ${existing.account.username}`,
    );
    return true;
  }

  // ============================================================
  // ESTADÍSTICAS DE USUARIOS
  // ============================================================

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byStatus: { status: string; count: number }[];
    byRole: { role: string; count: number }[];
  }> {
    // Total de cuentas
    const totalResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(account);

    const activeResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(account)
      .where(eq(account.active, true));

    const inactiveResult = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(account)
      .where(eq(account.active, false));

    // Estadísticas por estado de empleado
    const byStatus = await this.db
      .select({
        status: employee.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(employee)
      .groupBy(employee.status);

    // Estadísticas por rol de cuenta
    const byRole = await this.db
      .select({
        role: account.role,
        count: sql<number>`COUNT(*)`,
      })
      .from(account)
      .groupBy(account.role);

    return {
      total: Number(totalResult[0]?.count || 0),
      active: Number(activeResult[0]?.count || 0),
      inactive: Number(inactiveResult[0]?.count || 0),
      byStatus: byStatus.map((s) => ({
        status: s.status || 'UNKNOWN',
        count: Number(s.count || 0),
      })),
      byRole: byRole.map((r) => ({
        role: r.role || 'employee',
        count: Number(r.count || 0),
      })),
    };
  }
}
