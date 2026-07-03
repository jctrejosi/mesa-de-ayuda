import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Listar todos los usuarios (con filtros y paginación)
   * GET /api/users
   */
  @Get()
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  /**
   * Obtener un usuario por ID
   * GET /api/users/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { id, exists: false, message: 'Usuario no encontrado' };
    }
    return user;
  }

  /**
   * Crear un nuevo usuario
   * POST /api/users
   */
  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  /**
   * Actualizar un usuario
   * PUT /api/users/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }

  /**
   * Desactivar un usuario (soft delete)
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);
  }

  /**
   * Cambiar estado del usuario (activar/desactivar)
   * PATCH /api/users/:id/toggle-status
   */
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }

  /**
   * Cambiar contraseña del usuario
   * PATCH /api/users/:id/change-password
   */
  @Patch(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.changePassword(
      id,
      data.currentPassword,
      data.newPassword,
    );
  }

  /**
   * Obtener estadísticas de usuarios
   * GET /api/users/stats
   */
  @Get('stats')
  async getStats() {
    return this.usersService.getStats();
  }
}
