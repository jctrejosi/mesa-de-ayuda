import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('register')
  async register(@Request() req, @Body() dto: RegisterAttendanceDto) {
    return this.attendanceService.register(req.user.employeeId, dto);
  }

  @Get('today')
  async getToday(@Request() req) {
    return this.attendanceService.getTodayAttendance(req.user.employeeId);
  }

  @Get('history')
  async getHistory(@Request() req, @Query() query: QueryAttendanceDto) {
    return this.attendanceService.getHistory(req.user.employeeId, query);
  }

  @Get('can-register/:type')
  async canRegister(@Request() req, @Param('type') type: string) {
    return this.attendanceService.canRegister(req.user.employeeId, type);
  }
}
