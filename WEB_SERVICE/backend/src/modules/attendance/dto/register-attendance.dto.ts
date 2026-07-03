import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RegisterAttendanceDto {
  @IsEnum(['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'])
  checkType: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  device?: string;
}
