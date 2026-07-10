/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { httpLoggerMiddleware } from './utils/logger';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { CorsConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Middleware de Correlation ID
  app.use(
    new CorrelationIdMiddleware().use.bind(new CorrelationIdMiddleware()),
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Seguridad
  app.use(helmet());
  app.use(compression());
  app.use(httpLoggerMiddleware());
  app.use(cookieParser());

  // CORS configurado desde .env
  const corsOptions = configService.get<CorsConfig>('app.cors');

  app.enableCors({
    origin: corsOptions?.origin ?? true,
    credentials: corsOptions?.credentials ?? false,
    methods: corsOptions?.methods ?? ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: corsOptions?.allowedHeaders ?? [
      'Content-Type',
      'Authorization',
    ],
    exposedHeaders: corsOptions?.exposedHeaders ?? [],
    maxAge: corsOptions?.maxAge ?? 86400,
    preflightContinue: corsOptions?.preflightContinue ?? false,
    optionsSuccessStatus: corsOptions?.optionsSuccessStatus ?? 204,
  });

  // Swagger (solo en desarrollo)
  if (configService.get('app.nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('HelpDesk API')
      .setDescription('API para el sistema de control de asistencia')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación')
      .addTag('attendance', 'Asistencia')
      .addTag('users', 'Usuarios')
      .addTag('company', 'Empresas y sucursales')
      .addTag('config', 'Configuración')
      .addTag('dashboard', 'Dashboard')
      .addTag('audit-logs', 'Logs de auditoría')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
