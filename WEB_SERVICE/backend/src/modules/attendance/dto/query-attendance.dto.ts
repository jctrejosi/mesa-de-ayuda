import {
  IsOptional,
  IsString,
  Min,
  IsDateString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAttendanceDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Fecha de inicio inválida. Formato: YYYY-MM-DD' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida. Formato: YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @IsEnum(['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'], {
    message:
      'Tipo inválido. Valores permitidos: ENTRY, EXIT, BREAK_START, BREAK_END',
  })
  type?: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

  @IsOptional()
  @IsInt({ message: 'El ID del empleado debe ser un número entero' })
  @Type(() => Number)
  employeeId?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la sucursal debe ser un número entero' })
  @Type(() => Number)
  branchId?: number;

  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser un texto' })
  orderBy?: 'createdAt' | 'checkType' | 'distance';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'El orden debe ser ASC o DESC' })
  orderDirection?: 'ASC' | 'DESC' = 'DESC';
}
