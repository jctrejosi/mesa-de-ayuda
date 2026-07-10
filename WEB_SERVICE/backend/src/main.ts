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
import { CorsConfig, HelmetConfig } from './config/configuration';

// ✅ Cargar variables de entorno desde .env.development.local
import * as dotenv from 'dotenv';
import * as path from 'path';

// Determinar qué archivo .env cargar según NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'development'
      ? '.env.development.local'
      : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`📁 Cargando configuración desde: ${envFile}`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ✅ 1. CORS PRIMERO (antes que cualquier otro middleware)
  const corsOptions = configService.get<CorsConfig>('app.cors');

  app.enableCors({
    origin: corsOptions?.origin ?? ['http://localhost:5173'],
    credentials: corsOptions?.credentials ?? true,
    methods: corsOptions?.methods ?? [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ],
    allowedHeaders: corsOptions?.allowedHeaders ?? [
      'Content-Type',
      'Authorization',
      'Accept',
    ],
    exposedHeaders: corsOptions?.exposedHeaders ?? [],
    maxAge: corsOptions?.maxAge ?? 86400,
    preflightContinue: corsOptions?.preflightContinue ?? false,
    optionsSuccessStatus: corsOptions?.optionsSuccessStatus ?? 204,
  });

  // ✅ 2. Helmet (después de CORS)
  const helmetConfig = configService.get<HelmetConfig>('app.helmet');

  app.use(
    helmet({
      crossOriginResourcePolicy: helmetConfig?.crossOriginResourcePolicy ?? {
        policy: 'cross-origin',
      },
      crossOriginOpenerPolicy: helmetConfig?.crossOriginOpenerPolicy ?? {
        policy: 'unsafe-none',
      },
      crossOriginEmbedderPolicy:
        helmetConfig?.crossOriginEmbedderPolicy ?? false,
    }),
  );

  // ✅ 3. Correlation ID
  app.use(
    new CorrelationIdMiddleware().use.bind(new CorrelationIdMiddleware()),
  );

  // ✅ 4. Body parsers y otros middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(compression());
  app.use(httpLoggerMiddleware());
  app.use(cookieParser());

  // ✅ 5. Swagger (solo en desarrollo)
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
  console.log(`📁 Archivo .env: ${envFile}`);
  console.log(
    `✅ CORS configurado con: ${JSON.stringify(corsOptions?.origin ?? ['http://localhost:5173'])}`,
  );
}

bootstrap();
