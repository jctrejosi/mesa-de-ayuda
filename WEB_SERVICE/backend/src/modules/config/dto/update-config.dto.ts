import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateConfigDto {
  @IsString({ message: 'La clave debe ser un texto' })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @MaxLength(120, { message: 'La clave no puede exceder 120 caracteres' })
  key: string | undefined;

  @IsNotEmpty({ message: 'El valor es obligatorio' })
  value: any;

  @IsOptional()
  @IsString({ message: 'El tipo debe ser un texto' })
  @IsIn(['string', 'number', 'boolean', 'json'], {
    message: 'El tipo debe ser: string, number, boolean o json',
  })
  type?: 'string' | 'number' | 'boolean' | 'json';

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  description?: string;
}
