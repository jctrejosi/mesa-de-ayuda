import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  // Datos de la persona
  @IsOptional()
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @MaxLength(10, {
    message: 'El tipo de documento no puede exceder 10 caracteres',
  })
  documentType?: string;

  @IsOptional()
  @IsString({ message: 'El número de documento debe ser un texto' })
  @MaxLength(30, {
    message: 'El número de documento no puede exceder 30 caracteres',
  })
  documentNumber?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(80, { message: 'El nombre no puede exceder 80 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser un texto' })
  @MaxLength(80, {
    message: 'El segundo nombre no puede exceder 80 caracteres',
  })
  middleName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  @MaxLength(80, { message: 'El apellido no puede exceder 80 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser un texto' })
  @MaxLength(80, {
    message: 'El segundo apellido no puede exceder 80 caracteres',
  })
  secondLastName?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)',
    },
  )
  birthDate?: string;

  @IsOptional()
  @IsString({ message: 'El género debe ser un texto' })
  @IsEnum(['M', 'F', 'OTHER'], { message: 'El género debe ser M, F o OTHER' })
  gender?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email corporativo debe ser un email válido' })
  @MaxLength(150, { message: 'El email no puede exceder 150 caracteres' })
  email?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email personal debe ser un email válido' })
  @MaxLength(150, { message: 'El email no puede exceder 150 caracteres' })
  personalEmail?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(30, { message: 'El teléfono no puede exceder 30 caracteres' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'El móvil debe ser un texto' })
  @MaxLength(30, { message: 'El móvil no puede exceder 30 caracteres' })
  mobile?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'La ciudad debe ser un texto' })
  @MaxLength(80, { message: 'La ciudad no puede exceder 80 caracteres' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto' })
  @MaxLength(80, { message: 'El estado no puede exceder 80 caracteres' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'El país debe ser un texto' })
  @MaxLength(80, { message: 'El país no puede exceder 80 caracteres' })
  country?: string;

  // Datos del empleado
  @IsOptional()
  @IsString({ message: 'El código de empleado debe ser un texto' })
  @MaxLength(30, {
    message: 'El código de empleado no puede exceder 30 caracteres',
  })
  employeeCode?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la sucursal debe ser un número' })
  @Type(() => Number)
  branchId?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  @Type(() => Number)
  departmentId?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del cargo debe ser un número' })
  @Type(() => Number)
  positionId?: number | null;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de contratación debe tener formato válido (YYYY-MM-DD)',
    },
  )
  hireDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de terminación debe tener formato válido (YYYY-MM-DD)',
    },
  )
  terminationDate?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto' })
  @IsEnum(['ACTIVE', 'INACTIVE', 'VACATION', 'SUSPENDED'], {
    message: 'El estado debe ser: ACTIVE, INACTIVE, VACATION o SUSPENDED',
  })
  status?: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'SUSPENDED';

  // Datos de la cuenta
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(60, {
    message: 'El nombre de usuario no puede exceder 60 caracteres',
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  @Type(() => Boolean)
  active?: boolean;
}
