import { IsOptional, IsString, Min, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['ACTIVE', 'INACTIVE', 'VACATION', 'SUSPENDED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'SUSPENDED';

  @IsOptional()
  @IsString()
  @IsEnum(['admin', 'manager', 'employee'])
  role?: 'admin' | 'manager' | 'employee';

  // ✅ Nuevos campos: nombres en lugar de IDs
  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  positionName?: string;
}
