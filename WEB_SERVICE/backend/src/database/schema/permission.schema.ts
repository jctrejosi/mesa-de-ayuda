import { mysqlTable, bigint, varchar } from 'drizzle-orm/mysql-core';

export const permission = mysqlTable('permission', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  code: varchar('code', { length: 80 }).unique(),
  moduleName: varchar('module_name', { length: 80 }),
  description: varchar('description', { length: 255 }),
});

export type Permission = typeof permission.$inferSelect;
export type NewPermission = typeof permission.$inferInsert;
