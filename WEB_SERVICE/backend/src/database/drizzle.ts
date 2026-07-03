import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { ConfigService } from '@nestjs/config';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';

let dbInstance: MySql2Database<typeof schema> | null = null;

export function getDbConnection(
  configService: ConfigService,
): MySql2Database<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = configService.get<string>('app.database.url');
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
  });

  dbInstance = drizzle(pool, { schema, mode: 'default' });
  return dbInstance;
}

// Para uso directo (sin NestJS) en scripts o migraciones
export function createDirectDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }
  const pool = mysql.createPool({ uri: url });
  return drizzle(pool, { schema, mode: 'default' });
}
