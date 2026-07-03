import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import { getDb } from '../../database/drizzle';
import { account, employee, person } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';

export interface JwtPayload {
  sub: number; // account.id
  username: string;
  employeeId: number;
  role?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    employeeId: number;
    fullName: string;
    email?: string | null;
    role?: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get db() {
    return getDb();
  }

  /**
   * Autentica un usuario por username y password
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<{
    account: typeof account.$inferSelect;
    employee: typeof employee.$inferSelect;
    person: typeof person.$inferSelect;
  } | null> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.username, username))
      .limit(1);

    if (!accounts.length) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" no encontrado`,
      );
      return null;
    }

    const userAccount = accounts[0];

    if (!userAccount.active) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" inactivo`,
      );
      return null;
    }

    const passwordHash = userAccount.passwordHash;
    if (!passwordHash) {
      this.logger.warn(
        `Intento de login fallido: usuario "${username}" sin hash de contraseña`,
      );
      return null;
    }

    const comparePassword = compare as (
      plainText: string,
      hashedPassword: string,
    ) => Promise<boolean>;

    const isPasswordValid = await comparePassword(password, passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(
        `Intento de login fallido: contraseña incorrecta para "${username}"`,
      );
      // Incrementar intentos fallidos
      await this.db
        .update(account)
        .set({
          failedAttempts: (userAccount.failedAttempts || 0) + 1,
        })
        .where(eq(account.id, userAccount.id));
      return null;
    }

    // Resetear intentos fallidos y actualizar último login
    await this.db
      .update(account)
      .set({
        failedAttempts: 0,
        lastLogin: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    // Obtener datos del empleado y persona
    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, userAccount.employeeId))
      .limit(1);

    if (!employees.length) {
      this.logger.error(
        `Empleado no encontrado para account ID ${userAccount.id}`,
      );
      return null;
    }

    const persons = await this.db
      .select()
      .from(person)
      .where(eq(person.id, employees[0].personId))
      .limit(1);

    if (!persons.length) {
      this.logger.error(
        `Persona no encontrada para employee ID ${employees[0].id}`,
      );
      return null;
    }

    return {
      account: userAccount,
      employee: employees[0],
      person: persons[0],
    };
  }

  /**
   * Login con username y password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const userData = await this.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!userData) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const fullName = [
      userData.person.firstName,
      userData.person.middleName,
      userData.person.lastName,
      userData.person.secondLastName,
    ]
      .filter(Boolean)
      .join(' ');

    const payload: JwtPayload = {
      sub: userData.account.id,
      username: userData.account.username,
      employeeId: userData.account.employeeId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getJwtExpiration(),
      user: {
        id: userData.account.id,
        username: userData.account.username,
        employeeId: userData.account.employeeId,
        fullName: fullName || 'Usuario',
        email: userData.person.email,
      },
    };
  }

  /**
   * Login con Microsoft SSO
   */
  microsoftLogin(_: MicrosoftLoginDto): Promise<LoginResponse> {
    void _;

    // TODO: Implementar verificación con Microsoft Graph API
    // 1. Validar el token de Microsoft
    // 2. Extraer email y datos del usuario
    // 3. Buscar o crear usuario en la base de datos

    throw new BadRequestException(
      'Microsoft SSO no está implementado aún. Por favor usa login tradicional.',
    );
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const jwtSecret = this.configService.get<string>('app.jwt.secret');

      if (!jwtSecret) {
        this.logger.error('JWT secret no configurado');
        throw new UnauthorizedException('Usuario no válido');
      }

      const refreshToken = refreshTokenDto.refreshToken;

      if (!refreshToken) {
        this.logger.warn('Refresh token no provisto');
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Validar el refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: jwtSecret,
      });

      // Verificar que el usuario existe
      const accounts = await this.db
        .select()
        .from(account)
        .where(eq(account.id, payload.sub))
        .limit(1);

      if (!accounts.length || !accounts[0].active) {
        throw new UnauthorizedException('Usuario no válido');
      }

      // Generar nuevo access token
      const newPayload: JwtPayload = {
        sub: payload.sub,
        username: payload.username,
        employeeId: payload.employeeId,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: this.getJwtExpiration(),
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error al refrescar token: ${message}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(accountId: number): Promise<{
    account: typeof account.$inferSelect;
    employee: typeof employee.$inferSelect;
    person: typeof person.$inferSelect;
  }> {
    const accounts = await this.db
      .select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (!accounts.length) {
      throw new NotFoundException(`Usuario con ID ${accountId} no encontrado`);
    }

    const employees = await this.db
      .select()
      .from(employee)
      .where(eq(employee.id, accounts[0].employeeId))
      .limit(1);

    if (!employees.length) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const persons = await this.db
      .select()
      .from(person)
      .where(eq(person.id, employees[0].personId))
      .limit(1);

    if (!persons.length) {
      throw new NotFoundException('Persona no encontrada');
    }

    return {
      account: accounts[0],
      employee: employees[0],
      person: persons[0],
    };
  }

  /**
   * Cierra la sesión (logout)
   */
  logout(accountId: number): Promise<{ success: boolean; message: string }> {
    // En un sistema con refresh tokens almacenados, aquí se invalidaría el token
    this.logger.log(`Logout para account ID ${accountId}`);
    return Promise.resolve({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  }

  /**
   * Genera un refresh token con expiración más larga
   */
  private generateRefreshToken(payload: JwtPayload): string {
    const refreshExpiresIn =
      this.configService.get<string>('app.jwt.refreshExpiresIn') ?? '30d';

    // Usar un objeto de opciones con tipo any para evitar conflictos de tipos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      expiresIn: refreshExpiresIn,
    };

    return this.jwtService.sign(payload, options);
  }

  /**
   * Obtiene el tiempo de expiración del token en segundos
   */
  private getJwtExpiration(): number {
    const expiresIn =
      this.configService.get<string>('app.jwt.expiresIn') ?? '7d';
    const seconds = this.parseDurationToSeconds(expiresIn);
    return seconds;
  }

  /**
   * Convierte una duración (ej: "7d", "1h") a segundos
   */
  private parseDurationToSeconds(duration: string): number {
    const value = parseInt(duration, 10);
    const unit = duration.replace(/[0-9]/g, '');

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 604800; // 7 días por defecto
    }
  }
}
