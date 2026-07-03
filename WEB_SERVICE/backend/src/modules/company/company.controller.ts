import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateBranchDto,
  UpdateBranchDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('company')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // ============================================================
  // COMPANY
  // ============================================================

  @Get('companies')
  async findAllCompanies() {
    return this.companyService.findAllCompanies();
  }

  @Get('companies/:id')
  async findCompany(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findCompanyById(id);
  }

  @Post('companies')
  async createCompany(@Body() data: CreateCompanyDto) {
    return this.companyService.createCompany(data);
  }

  @Put('companies/:id')
  async updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(id, data);
  }

  @Delete('companies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompany(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.deleteCompany(id);
  }

  // ============================================================
  // BRANCH
  // ============================================================

  @Get('branches')
  async findAllBranches(@Query('companyId') companyId?: string) {
    const id = companyId ? parseInt(companyId, 10) : undefined;
    return this.companyService.findAllBranches(id);
  }

  @Get('branches/:id')
  async findBranch(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findBranchById(id);
  }

  @Post('branches')
  async createBranch(@Body() data: CreateBranchDto) {
    return this.companyService.createBranch(data);
  }

  @Put('branches/:id')
  async updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateBranchDto,
  ) {
    return this.companyService.updateBranch(id, data);
  }

  @Delete('branches/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBranch(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.deleteBranch(id);
  }

  // ============================================================
  // DEPARTMENT
  // ============================================================

  @Get('departments')
  async findAllDepartments(@Query('companyId') companyId?: string) {
    const id = companyId ? parseInt(companyId, 10) : undefined;
    return this.companyService.findAllDepartments(id);
  }

  @Get('departments/:id')
  async findDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findDepartmentById(id);
  }

  @Post('departments')
  async createDepartment(@Body() data: CreateDepartmentDto) {
    return this.companyService.createDepartment(data);
  }

  @Put('departments/:id')
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDepartmentDto,
  ) {
    return this.companyService.updateDepartment(id, data);
  }

  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.deleteDepartment(id);
  }

  // ============================================================
  // POSITION
  // ============================================================

  @Get('positions')
  async findAllPositions(@Query('companyId') companyId?: string) {
    const id = companyId ? parseInt(companyId, 10) : undefined;
    return this.companyService.findAllPositions(id);
  }

  @Get('positions/:id')
  async findPosition(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findPositionById(id);
  }

  @Post('positions')
  async createPosition(@Body() data: CreatePositionDto) {
    return this.companyService.createPosition(data);
  }

  @Put('positions/:id')
  async updatePosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePositionDto,
  ) {
    return this.companyService.updatePosition(id, data);
  }

  @Delete('positions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePosition(@Param('id', ParseIntPipe) id: number) {
    await this.companyService.deletePosition(id);
  }
}
