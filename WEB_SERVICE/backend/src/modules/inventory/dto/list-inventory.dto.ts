import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInventoryDto {
  @ApiPropertyOptional({
    description: 'Página (empieza en 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Registros por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Buscar por código, PLU, EAN o nombre',
    example: 'arroz',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: [
      'codigo',
      'nombre',
      'precio_venta',
      'saldo',
      'plu',
      'ean',
      'createdAt',
    ],
    description: 'Campo por el cual ordenar',
    default: 'codigo',
  })
  @IsOptional()
  @IsIn([
    'codigo',
    'nombre',
    'precio_venta',
    'saldo',
    'plu',
    'ean',
    'createdAt',
  ])
  sortBy?: string = 'codigo';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Dirección del orden',
    default: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
