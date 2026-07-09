import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class SaveInventoryItemDto {
  @ApiProperty({ example: '101130100000100' })
  @IsString()
  codigo!: string;

  @ApiProperty({ example: '100', required: false })
  @IsOptional()
  @IsString()
  plu?: string;

  @ApiProperty({ example: '7702014393484', required: false })
  @IsOptional()
  @IsString()
  ean?: string;

  @ApiProperty({ example: 'ARVEJA/ZANAHORIA SAN JORGE 180G' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 5700 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  precio_venta!: number;

  @ApiProperty({ example: 41 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  saldo!: number;

  @ApiProperty({ example: '100.JPG', required: false })
  @IsOptional()
  @IsString()
  imagen?: string;
}

export class SaveInventoryDto {
  @ApiProperty({ type: [SaveInventoryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveInventoryItemDto)
  items: SaveInventoryItemDto[] = [];
}
