import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { getDb } from '../../database/drizzle';
import {
  company,
  branch,
  department,
  position,
  employee,
  type Company,
  type NewCompany,
  type Branch,
  type NewBranch,
  type Department,
  type NewDepartment,
  type Position,
  type NewPosition,
} from '../../database/schema';
import { eq } from 'drizzle-orm';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateBranchDto,
  UpdateBranchDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
} from './dto';

@Injectable()
export class CompanyService {
  private get db() {
    return getDb();
  }

  // ============================================================
  // COMPANY
  // ============================================================

  async findAllCompanies(): Promise<Company[]> {
    return this.db.select().from(company).orderBy(company.name);
  }

  async findCompanyById(id: number): Promise<Company | null> {
    const results = await this.db
      .select()
      .from(company)
      .where(eq(company.id, id))
      .limit(1);
    return results[0] || null;
  }

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    const existing = await this.db
      .select()
      .from(company)
      .where(eq(company.name, data.name))
      .limit(1);

    if (existing.length) {
      throw new BadRequestException(
        `Ya existe una empresa con el nombre "${data.name}"`,
      );
    }

    const newCompany: NewCompany = {
      name: data.name,
      nit: data.nit || null,
      active: data.active !== undefined ? data.active : true,
    };

    const result = await this.db.insert(company).values(newCompany);
    const id = Number(result[0]?.insertId || 0);
    const created = await this.findCompanyById(id);
    if (!created) {
      throw new BadRequestException('Error al crear la empresa');
    }
    return created;
  }

  async updateCompany(id: number, data: UpdateCompanyDto): Promise<Company> {
    const existing = await this.findCompanyById(id);
    if (!existing) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    const updateData: Partial<NewCompany> = {};
    if (data.name) updateData.name = data.name;
    if (data.nit !== undefined) updateData.nit = data.nit;
    if (data.active !== undefined) updateData.active = data.active;

    await this.db.update(company).set(updateData).where(eq(company.id, id));

    const updated = await this.findCompanyById(id);
    return updated!;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const existing = await this.findCompanyById(id);
    if (!existing) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    // Verificar si tiene sucursales asociadas
    const branches = await this.db
      .select()
      .from(branch)
      .where(eq(branch.companyId, id))
      .limit(1);

    if (branches.length) {
      throw new BadRequestException(
        'No se puede eliminar la empresa porque tiene sucursales asociadas',
      );
    }

    await this.db.delete(company).where(eq(company.id, id));
    return true;
  }

  // ============================================================
  // BRANCH
  // ============================================================

  async findAllBranches(companyId?: number): Promise<Branch[]> {
    const query = this.db.select().from(branch);
    if (companyId) {
      query.where(eq(branch.companyId, companyId));
    }
    return query.orderBy(branch.name);
  }

  async findBranchById(id: number): Promise<Branch | null> {
    const results = await this.db
      .select()
      .from(branch)
      .where(eq(branch.id, id))
      .limit(1);
    return results[0] || null;
  }

  async createBranch(data: CreateBranchDto): Promise<Branch> {
    // Verificar que la empresa existe
    const companyExists = await this.findCompanyById(data.companyId);
    if (!companyExists) {
      throw new BadRequestException(
        `Empresa con ID ${data.companyId} no encontrada`,
      );
    }

    const newBranch: NewBranch = {
      companyId: data.companyId,
      name: data.name,
      address: data.address || null,
      latitude: data.latitude ? String(data.latitude) : null,
      longitude: data.longitude ? String(data.longitude) : null,
      allowedRadius: data.allowedRadius || 50,
      timezone: data.timezone || null,
      active: data.active !== undefined ? data.active : true,
    };

    const result = await this.db.insert(branch).values(newBranch);
    const id = Number(result[0]?.insertId || 0);
    const created = await this.findBranchById(id);
    if (!created) {
      throw new BadRequestException('Error al crear la sucursal');
    }
    return created;
  }

  async updateBranch(id: number, data: UpdateBranchDto): Promise<Branch> {
    const existing = await this.findBranchById(id);
    if (!existing) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    if (data.companyId) {
      const companyExists = await this.findCompanyById(data.companyId);
      if (!companyExists) {
        throw new BadRequestException(
          `Empresa con ID ${data.companyId} no encontrada`,
        );
      }
    }

    const updateData: Partial<NewBranch> = {};
    if (data.companyId) updateData.companyId = data.companyId;
    if (data.name) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.latitude !== undefined)
      updateData.latitude = data.latitude ? String(data.latitude) : null;
    if (data.longitude !== undefined)
      updateData.longitude = data.longitude ? String(data.longitude) : null;
    if (data.allowedRadius !== undefined)
      updateData.allowedRadius = data.allowedRadius;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.active !== undefined) updateData.active = data.active;

    await this.db.update(branch).set(updateData).where(eq(branch.id, id));

    const updated = await this.findBranchById(id);
    return updated!;
  }

  async deleteBranch(id: number): Promise<boolean> {
    const existing = await this.findBranchById(id);
    if (!existing) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    // Verificar si tiene empleados asociados
    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.branchId, id))
      .limit(1);

    if (employees.length) {
      throw new BadRequestException(
        'No se puede eliminar la sucursal porque tiene empleados asociados',
      );
    }

    await this.db.delete(branch).where(eq(branch.id, id));
    return true;
  }

  // ============================================================
  // DEPARTMENT
  // ============================================================

  async findAllDepartments(companyId?: number): Promise<Department[]> {
    const query = this.db.select().from(department);
    if (companyId) {
      query.where(eq(department.companyId, companyId));
    }
    return query.orderBy(department.name);
  }

  async findDepartmentById(id: number): Promise<Department | null> {
    const results = await this.db
      .select()
      .from(department)
      .where(eq(department.id, id))
      .limit(1);
    return results[0] || null;
  }

  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    const companyExists = await this.findCompanyById(data.companyId);
    if (!companyExists) {
      throw new BadRequestException(
        `Empresa con ID ${data.companyId} no encontrada`,
      );
    }

    const newDepartment: NewDepartment = {
      companyId: data.companyId,
      name: data.name,
      description: data.description || null,
    };

    const result = await this.db.insert(department).values(newDepartment);
    const id = Number(result[0]?.insertId || 0);
    const created = await this.findDepartmentById(id);
    if (!created) {
      throw new BadRequestException('Error al crear el departamento');
    }
    return created;
  }

  async updateDepartment(
    id: number,
    data: UpdateDepartmentDto,
  ): Promise<Department> {
    const existing = await this.findDepartmentById(id);
    if (!existing) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (data.companyId) {
      const companyExists = await this.findCompanyById(data.companyId);
      if (!companyExists) {
        throw new BadRequestException(
          `Empresa con ID ${data.companyId} no encontrada`,
        );
      }
    }

    const updateData: Partial<NewDepartment> = {};
    if (data.companyId) updateData.companyId = data.companyId;
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    await this.db
      .update(department)
      .set(updateData)
      .where(eq(department.id, id));

    const updated = await this.findDepartmentById(id);
    return updated!;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const existing = await this.findDepartmentById(id);
    if (!existing) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    // Verificar si tiene empleados asociados
    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.departmentId, id))
      .limit(1);

    if (employees.length) {
      throw new BadRequestException(
        'No se puede eliminar el departamento porque tiene empleados asociados',
      );
    }

    await this.db.delete(department).where(eq(department.id, id));
    return true;
  }

  // ============================================================
  // POSITION
  // ============================================================

  async findAllPositions(companyId?: number): Promise<Position[]> {
    const query = this.db.select().from(position);
    if (companyId) {
      query.where(eq(position.companyId, companyId));
    }
    return query.orderBy(position.name);
  }

  async findPositionById(id: number): Promise<Position | null> {
    const results = await this.db
      .select()
      .from(position)
      .where(eq(position.id, id))
      .limit(1);
    return results[0] || null;
  }

  async createPosition(data: CreatePositionDto): Promise<Position> {
    const companyExists = await this.findCompanyById(data.companyId);
    if (!companyExists) {
      throw new BadRequestException(
        `Empresa con ID ${data.companyId} no encontrada`,
      );
    }

    const newPosition: NewPosition = {
      companyId: data.companyId,
      name: data.name,
      description: data.description || null,
    };

    const result = await this.db.insert(position).values(newPosition);
    const id = Number(result[0]?.insertId || 0);
    const created = await this.findPositionById(id);
    if (!created) {
      throw new BadRequestException('Error al crear el cargo');
    }
    return created;
  }

  async updatePosition(id: number, data: UpdatePositionDto): Promise<Position> {
    const existing = await this.findPositionById(id);
    if (!existing) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }

    if (data.companyId) {
      const companyExists = await this.findCompanyById(data.companyId);
      if (!companyExists) {
        throw new BadRequestException(
          `Empresa con ID ${data.companyId} no encontrada`,
        );
      }
    }

    const updateData: Partial<NewPosition> = {};
    if (data.companyId) updateData.companyId = data.companyId;
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    await this.db.update(position).set(updateData).where(eq(position.id, id));

    const updated = await this.findPositionById(id);
    return updated!;
  }

  async deletePosition(id: number): Promise<boolean> {
    const existing = await this.findPositionById(id);
    if (!existing) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }

    // Verificar si tiene empleados asociados
    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.positionId, id))
      .limit(1);

    if (employees.length) {
      throw new BadRequestException(
        'No se puede eliminar el cargo porque tiene empleados asociados',
      );
    }

    await this.db.delete(position).where(eq(position.id, id));
    return true;
  }
}
