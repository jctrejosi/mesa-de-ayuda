import { mysqlTable, bigint, varchar, text } from 'drizzle-orm/mysql-core';

export const role = mysqlTable('role', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  name: varchar('name', { length: 80 }).unique(),
  description: text('description'),
});

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;
