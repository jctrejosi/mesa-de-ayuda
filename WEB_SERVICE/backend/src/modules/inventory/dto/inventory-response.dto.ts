import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemDto {
  @ApiProperty({ example: '101130100000100' })
  codigo!: string;

  @ApiProperty({ example: '100' })
  plu!: string;

  @ApiProperty({ example: '7702014393484' })
  ean!: string;

  @ApiProperty({ example: 'ARVEJA/ZANAHORIA SAN JORGE 180G' })
  nombre!: string;

  @ApiProperty({ example: 5700 })
  precio_venta!: number;

  @ApiProperty({ example: 41 })
  saldo!: number;

  @ApiProperty({ example: '100.JPG' })
  imagen!: string;
}

export class ParseInventoryResponseDto {
  @ApiProperty({ type: [InventoryItemDto] })
  items!: InventoryItemDto[];

  @ApiProperty({ example: 14 })
  count!: number;
}
