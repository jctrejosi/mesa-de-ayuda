import {
  mysqlTable,
  bigint,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const company = mysqlTable('company', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  nit: varchar('nit', { length: 30 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Company = typeof company.$inferSelect;
export type NewCompany = typeof company.$inferInsert;
