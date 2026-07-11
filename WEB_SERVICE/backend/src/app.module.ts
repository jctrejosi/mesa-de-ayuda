import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SentryFilter } from './common/filters/sentry.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { SentryModule } from './modules/sentry/sentry.module';
import { initializeDatabase } from './database/drizzle';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CompanyModule } from './modules/company/company.module';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { AuditLogModule } from './modules/audit/audit-log.module';
import { InventoryModule } from './modules/inventory/inventory.module';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development.local',
      // ✅ Expandir variables (para usar ${VAR} en el .env)
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    SentryModule,
    AuthModule,
    AttendanceModule,
    CompanyModule,
    AppConfigModule,
    DashboardModule,
    UsersModule,
    AuditLogModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      initializeDatabase(this.configService);
      console.log('✅ Database initialized successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error al inicializar la base de datos:', message);
    }
  }
}
