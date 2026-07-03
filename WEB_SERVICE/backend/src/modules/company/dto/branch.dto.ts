import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @IsNumber({}, { message: 'El ID de la empresa debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio' })
  @Type(() => Number)
  companyId!: number;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El radio permitido debe ser un número' })
  @Min(0, { message: 'El radio permitido no puede ser negativo' })
  @Type(() => Number)
  allowedRadius?: number;

  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser un texto' })
  @MaxLength(50, { message: 'La zona horaria no puede exceder 50 caracteres' })
  timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  @Type(() => Boolean)
  active?: boolean;
}

export class UpdateBranchDto {
  @IsOptional()
  @IsNumber({}, { message: 'El ID de la empresa debe ser un número' })
  @Type(() => Number)
  companyId?: number;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El radio permitido debe ser un número' })
  @Min(0, { message: 'El radio permitido no puede ser negativo' })
  @Type(() => Number)
  allowedRadius?: number;

  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser un texto' })
  @MaxLength(50, { message: 'La zona horaria no puede exceder 50 caracteres' })
  timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  @Type(() => Boolean)
  active?: boolean;
}
