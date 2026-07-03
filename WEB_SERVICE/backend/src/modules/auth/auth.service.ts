import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db } from '../../database/drizzle';
import { account, employee, person } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string) {
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.username, username))
      .limit(1);

    if (!accounts.length) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userAccount = accounts[0];
    const isPasswordValid = await bcrypt.compare(
      password,
      userAccount.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!userAccount.active) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Obtener datos del empleado
    const employees = await db
      .select()
      .from(employee)
      .where(eq(employee.id, userAccount.employeeId))
      .limit(1);

    const persons = await db
      .select()
      .from(person)
      .where(eq(person.id, employees[0]?.personId))
      .limit(1);

    return {
      account: userAccount,
      employee: employees[0],
      person: persons[0],
    };
  }

  async login(loginDto: LoginDto) {
    const userData = await this.validateUser(
      loginDto.username,
      loginDto.password,
    );

    const payload = {
      sub: userData.account.id,
      username: userData.account.username,
      employeeId: userData.account.employeeId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: userData.account.id,
        username: userData.account.username,
        employeeId: userData.account.employeeId,
        fullName: `${userData.person.firstName} ${userData.person.lastName}`,
      },
    };
  }

  async microsoftLogin(microsoftDto: MicrosoftLoginDto) {
    // Implementar Microsoft SSO
    // Verificar token con Microsoft Graph API
    // Buscar usuario por email o crear uno nuevo
    throw new Error('Microsoft SSO not implemented yet');
  }

  async getProfile(accountId: number) {
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (!accounts.length) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const employees = await db
      .select()
      .from(employee)
      .where(eq(employee.id, accounts[0].employeeId))
      .limit(1);

    const persons = await db
      .select()
      .from(person)
      .where(eq(person.id, employees[0]?.personId))
      .limit(1);

    return {
      ...accounts[0],
      employee: employees[0],
      person: persons[0],
    };
  }
}
