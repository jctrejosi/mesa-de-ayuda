import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterAttendanceDto {
  @IsEnum(['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'], {
    message:
      'Tipo de registro inválido. Valores permitidos: ENTRY, EXIT, BREAK_START, BREAK_END',
  })
  @IsNotEmpty({ message: 'El tipo de registro es obligatorio' })
  checkType!: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

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
  @IsString({ message: 'El IP debe ser un texto' })
  ip?: string;

  @IsOptional()
  @IsString({ message: 'El dispositivo debe ser un texto' })
  device?: string;

  @IsOptional()
  @IsString({ message: 'El user-agent debe ser un texto' })
  userAgent?: string;
}
