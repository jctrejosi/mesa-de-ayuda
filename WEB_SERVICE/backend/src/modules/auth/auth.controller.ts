import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../interfaces/request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login con username y password
   * POST /api/auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('========================================');
    console.log('📥 LOGIN REQUEST RECEIVED:');
    console.log('  - Body completo:', JSON.stringify(loginDto, null, 2));
    console.log('  - Username:', loginDto.username);
    console.log('  - Password length:', loginDto.password?.length);
    console.log('  - Timestamp:', new Date().toISOString());
    console.log('========================================');

    try {
      const result = await this.authService.login(loginDto);
      console.log('✅ Login exitoso:', {
        userId: result.user?.id,
        username: result.user?.username,
        role: result.user?.role,
      });
      return result;
    } catch (error: unknown) {
      const hasResponse = (err: unknown): err is { response: unknown } =>
        typeof err === 'object' && err !== null && 'response' in err;

      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      const response = hasResponse(error) ? error.response : undefined;

      console.error('❌ Error en login:', {
        message,
        stack,
        response,
      });
      throw error;
    }
  }

  /**
   * Login con Microsoft SSO
   * POST /api/auth/microsoft
   */
  @Public()
  @Post('microsoft')
  @HttpCode(HttpStatus.OK)
  microsoftLogin(@Body() microsoftDto: MicrosoftLoginDto) {
    return this.authService.microsoftLogin(microsoftDto);
  }

  /**
   * Refrescar token de acceso
   * POST /api/auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.sub);
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: { refreshToken?: string },
  ) {
    return this.authService.logout(user.sub, body?.refreshToken);
  }
}
