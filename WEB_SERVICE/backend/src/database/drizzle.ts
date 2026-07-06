import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { ConfigService } from '@nestjs/config';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';

let dbInstance: MySql2Database<typeof schema> | null = null;

export let db: MySql2Database<typeof schema>;

function createPool(databaseUrl: string) {
  return mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

export function initializeDatabase(
  configService: ConfigService,
): MySql2Database<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl =
    configService.get<string>('app.database.url') ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not defined. Please check your .env file or environment variables.',
    );
  }

  const pool = createPool(databaseUrl);

  dbInstance = drizzle(pool, {
    schema,
    mode: 'default',
  });

  db = dbInstance;

  return dbInstance;
}

export function getDb(): MySql2Database<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }

  return db;
}

export function createDirectDb(): MySql2Database<typeof schema> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = createPool(databaseUrl);

  return drizzle(pool, {
    schema,
    mode: 'default',
  });
}
