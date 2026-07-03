import {
  mysqlTable,
  bigint,
  varchar,
  json,
  timestamp,
  text,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { account } from './account.schema';

export interface AuditLogChanges {
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export const auditLog = mysqlTable(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    accountId: bigint('account_id', { mode: 'number' }),
    moduleName: varchar('module_name', { length: 100 }),
    action: varchar('action', { length: 100 }),
    entityName: varchar('entity_name', { length: 100 }),
    entityId: bigint('entity_id', { mode: 'number' }),
    oldValues: json('old_values').$type<AuditLogChanges['oldValues']>(),
    newValues: json('new_values').$type<AuditLogChanges['newValues']>(),
    ip: varchar('ip', { length: 60 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    accountIdx: index('idx_audit_account').on(table.accountId),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  account: one(account, {
    fields: [auditLog.accountId],
    references: [account.id],
  }),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
