import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsInt({ message: 'El número de página debe ser un entero' })
  @Min(1, { message: 'El número de página debe ser mayor o igual a 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'El límite debe ser un entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto' })
  @IsEnum(['ACTIVE', 'INACTIVE', 'VACATION', 'SUSPENDED'], {
    message: 'El estado debe ser: ACTIVE, INACTIVE, VACATION o SUSPENDED',
  })
  status?: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'SUSPENDED';

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la sucursal debe ser un número' })
  @Type(() => Number)
  branchId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  @Type(() => Number)
  departmentId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del cargo debe ser un número' })
  @Type(() => Number)
  positionId?: number;
}
