import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemDto {
  @ApiProperty({ example: '101130100000100' })
  codigo!: string;

  @ApiProperty({
    example: '100',
    nullable: true,
    required: false,
  })
  plu!: string | null;

  @ApiProperty({
    example: '7702014393484',
    nullable: true,
    required: false,
  })
  ean!: string | null;

  @ApiProperty({ example: 'ARVEJA/ZANAHORIA SAN JORGE 180G' })
  nombre!: string;

  @ApiProperty({
    example: 5700.01,
  })
  precio_venta!: number;

  @ApiProperty({ example: 41 })
  saldo!: number;

  @ApiProperty({
    example: '/uploads/inventory/100.jpg',
    nullable: true,
    required: false,
  })
  imagen!: string | null;
}

export class ParseInventoryResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  items!: InventoryItemDto[];

  @ApiProperty({ example: 14 })
  count!: number;
}

export class PaginatedInventoryResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  items!: InventoryItemDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
