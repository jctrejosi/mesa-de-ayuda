import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { getDb } from '../../../database/drizzle';
import { account } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret') || 'secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar que el usuario existe y está activo
    const db = getDb();
    const accounts = await db
      .select({
        role: account.role,
        active: account.active,
      })
      .from(account)
      .where(eq(account.id, payload.sub))
      .limit(1);

    if (!accounts.length || !accounts[0].active) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return {
      sub: payload.sub,
      username: payload.username,
      employeeId: payload.employeeId,
      role: accounts[0].role,
    };
  }
}
