import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @IsNumber({}, { message: 'El ID de la empresa debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio' })
  @Type(() => Number)
  companyId!: number;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsNumber({}, { message: 'El ID de la empresa debe ser un número' })
  @Type(() => Number)
  companyId?: number;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;
}
