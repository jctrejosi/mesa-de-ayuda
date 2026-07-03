/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { CorsOptions } from 'cors';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));

  const configService = app.get(ConfigService);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents
  const corsValue = configService.get<CorsOptions | undefined>('app.cors');
  // runtime check to satisfy type-safety lint rule
  if (corsValue && typeof corsValue === 'object') {
    app.enableCors(corsValue);
  } else {
    app.enableCors();
  }
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
