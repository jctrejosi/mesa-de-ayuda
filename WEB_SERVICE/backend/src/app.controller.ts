import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { getDb } from './database/drizzle';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'helpdesk-api',
      version: '1.0.0',
      database: {
        status: 'unknown',
        connected: false,
        error: '',
      },
    };

    try {
      const db = getDb();

      await db.execute(sql`SELECT 1 AS connected`);

      healthCheck.database.status = 'ok';
      healthCheck.database.connected = true;

      return healthCheck;
    } catch (error) {
      console.error('========== DATABASE ERROR ==========');
      console.dir(error, { depth: null });
      console.error('====================================');

      healthCheck.status = 'degraded';
      healthCheck.database.status = 'error';
      healthCheck.database.connected = false;
      healthCheck.database.error =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error);

      return healthCheck;
    }
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
