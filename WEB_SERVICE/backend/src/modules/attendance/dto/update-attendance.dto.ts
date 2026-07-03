import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsEnum(['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'], {
    message:
      'Tipo de registro inválido. Valores permitidos: ENTRY, EXIT, BREAK_START, BREAK_END',
  })
  checkType?: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90 grados' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90 grados' })
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180 grados' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180 grados' })
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La precisión debe ser un número' })
  @Min(0, { message: 'La precisión no puede ser negativa' })
  @Type(() => Number)
  accuracy?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  @Type(() => Number)
  distance?: number;

  @IsOptional()
  @IsString({ message: 'El IP debe ser un texto' })
  ip?: string;

  @IsOptional()
  @IsString({ message: 'El dispositivo debe ser un texto' })
  device?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la sucursal debe ser un número' })
  @Type(() => Number)
  branchId?: number;
}
