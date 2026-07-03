import {
  mysqlTable,
  bigint,
  varchar,
  int,
  datetime,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { employee } from './employee.schema';

export const account = mysqlTable(
  'account',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    employeeId: bigint('employee_id', { mode: 'number' }).notNull(),
    username: varchar('username', { length: 60 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    failedAttempts: int('failed_attempts').default(0),
    lockedUntil: datetime('locked_until'),
    lastLogin: datetime('last_login'),
    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    employeeIdx: index('idx_account_employee').on(table.employeeId),
  }),
);

export const accountRelations = relations(account, ({ one }) => ({
  employee: one(employee, {
    fields: [account.employeeId],
    references: [employee.id],
  }),
}));

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
