import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'El NIT debe ser un texto' })
  @MaxLength(30, { message: 'El NIT no puede exceder 30 caracteres' })
  nit?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  @Type(() => Boolean)
  active?: boolean;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El NIT debe ser un texto' })
  @MaxLength(30, { message: 'El NIT no puede exceder 30 caracteres' })
  nit?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  @Type(() => Boolean)
  active?: boolean;
}
