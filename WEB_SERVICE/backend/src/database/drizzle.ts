import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { ConfigService } from '@nestjs/config';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';

let dbInstance: MySql2Database<typeof schema> | null = null;

// Exportar la instancia para uso directo (después de inicializar)
export let db: MySql2Database<typeof schema>;

/**
 * Inicializa la conexión a la base de datos
 * Debe llamarse en el módulo principal o en el bootstrap
 */
export function initializeDatabase(
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
    timezone: 'Z',
  });

  dbInstance = drizzle(pool, { schema, mode: 'default' });
  db = dbInstance;
  return dbInstance;
}

/**
 * Obtiene la instancia de la base de datos (sin inicializar)
 * Útil para usar en servicios ya inicializados
 */
export function getDb(): MySql2Database<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

/**
 * Para uso directo (sin NestJS) en scripts o migraciones
 */
export function createDirectDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }
  const pool = mysql.createPool({ uri: url, timezone: 'Z' });
  return drizzle(pool, { schema, mode: 'default' });
}
