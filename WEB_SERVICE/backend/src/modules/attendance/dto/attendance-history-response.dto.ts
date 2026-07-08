import { ApiProperty } from '@nestjs/swagger';

export class EmployeeInfoDto {
  @ApiProperty({ example: 'EMP-001' })
  code!: string;

  @ApiProperty({ example: 'Ana Martínez' })
  fullName!: string;

  @ApiProperty({
    example: 'https://.../avatar.jpg',
    nullable: true,
  })
  photo!: string | null;
}

export class BranchInfoDto {
  @ApiProperty({ example: 'Sede Principal' })
  name!: string;

  @ApiProperty({
    example: 'Calle 123 # 45-67',
    nullable: true,
  })
  address!: string | null;
}

export class AttendanceHistoryRecordDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ type: () => EmployeeInfoDto })
  employee!: EmployeeInfoDto;

  @ApiProperty({ example: '2026-07-08' })
  date!: string;

  @ApiProperty({ example: '08:05:00' })
  time!: string;

  @ApiProperty({
    enum: ['ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'],
  })
  type!: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';

  @ApiProperty({
    enum: ['APPROVED', 'LATE', 'REJECTED_LOCATION'],
  })
  status!: 'APPROVED' | 'LATE' | 'REJECTED_LOCATION';

  @ApiProperty({
    example: 12,
    nullable: true,
  })
  distance!: number | null;

  @ApiProperty({ type: () => BranchInfoDto })
  branch!: BranchInfoDto;

  @ApiProperty({
    example: '2026-07-08T08:05:00.000Z',
  })
  createdAt!: string;
}

export class AttendanceHistoryResponseDto {
  @ApiProperty({
    type: [AttendanceHistoryRecordDto],
  })
  records!: AttendanceHistoryRecordDto[];

  @ApiProperty({ example: 150 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 8 })
  totalPages!: number;
}
