import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  MaxLength,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceHistoryQueryDto {
  @ApiProperty({
    description: 'Página (empieza en 1)',
    example: 1,
    required: true,
  })
  @IsDefined({ message: 'La página es requerida' })
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  @Type(() => Number)
  page!: number;

  @ApiProperty({
    description: 'Registros por página',
    example: 20,
    required: true,
  })
  @IsDefined({ message: 'El límite es requerido' })
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Type(() => Number)
  limit!: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2026-06-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de inicio inválida. Formato YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2026-07-08',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida. Formato YYYY-MM-DD' })
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'],
    description: 'Tipo de registro',
  })
  @IsOptional()
  @IsEnum(['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'])
  type?: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

  @ApiPropertyOptional({
    enum: ['APPROVED', 'LATE', 'REJECTED'],
    description: 'Estado del registro (mayúsculas)',
  })
  @IsOptional()
  @IsEnum(['APPROVED', 'LATE', 'REJECTED'])
  status?: 'APPROVED' | 'LATE' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Buscar por nombre o código de empleado',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
