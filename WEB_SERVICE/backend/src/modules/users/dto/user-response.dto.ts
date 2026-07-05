import { Exclude, Expose, Transform } from 'class-transformer';

// Tipos auxiliares para las transformaciones
interface PersonLike {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  email?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  city?: string | null;
}

interface EmployeeLike {
  employeeCode?: string | null;
  status?: string | null;
}

interface BranchLike {
  name?: string | null;
}

interface DepartmentLike {
  name?: string | null;
}

interface PositionLike {
  name?: string | null;
}

interface CompanyLike {
  name?: string | null;
}

interface UserLike {
  employee?: EmployeeLike;
  person?: PersonLike;
  branch?: BranchLike;
  department?: DepartmentLike;
  position?: PositionLike;
  company?: CompanyLike;
  branchName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  companyName?: string | null;
}

type TransformContext = {
  obj: UserLike;
};

export class UserResponseDto {
  // Campos de la cuenta
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  role: 'admin' | 'manager' | 'employee';

  @Expose()
  active: boolean;

  @Expose()
  employeeId: number;

  @Expose()
  lastLogin: Date | null;

  @Expose()
  createdAt: Date;

  // Campos sensibles - EXCLUIDOS
  @Exclude()
  passwordHash: string;

  @Exclude()
  failedAttempts: number;

  @Exclude()
  lockedUntil: Date | null;

  // Campos de empleado
  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const employee = obj.employee || obj;
    return (employee as EmployeeLike)?.employeeCode || null;
  })
  employeeCode: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const employee = obj.employee || obj;
    return (employee as EmployeeLike)?.status || null;
  })
  status: string | null;

  // Campos de persona
  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    const fullName = [
      person?.firstName,
      person?.middleName,
      person?.lastName,
      person?.secondLastName,
    ]
      .filter(Boolean)
      .join(' ');
    return fullName || 'Sin nombre';
  })
  fullName: string;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.email || null;
  })
  email: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.documentNumber || null;
  })
  documentNumber: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.phone || null;
  })
  phone: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.mobile || null;
  })
  mobile: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.address || null;
  })
  address: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const person = (obj.person || obj) as PersonLike;
    return person?.city || null;
  })
  city: string | null;

  // Relaciones
  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const branch = obj.branch || obj.branchName;
    if (typeof branch === 'string') return branch;
    return (branch as BranchLike)?.name || null;
  })
  branchName: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const department = obj.department || obj.departmentName;
    if (typeof department === 'string') return department;
    return (department as DepartmentLike)?.name || null;
  })
  departmentName: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const position = obj.position || obj.positionName;
    if (typeof position === 'string') return position;
    return (position as PositionLike)?.name || null;
  })
  positionName: string | null;

  @Expose()
  @Transform(({ obj }: TransformContext) => {
    const company = obj.company || obj.companyName;
    if (typeof company === 'string') return company;
    return (company as CompanyLike)?.name || null;
  })
  companyName: string | null;
}
