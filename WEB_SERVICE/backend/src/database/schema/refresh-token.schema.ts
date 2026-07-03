import {
  mysqlTable,
  bigint,
  varchar,
  datetime,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { account } from './account.schema';

export const refreshToken = mysqlTable(
  'refresh_token',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    accountId: bigint('account_id', { mode: 'number' }).notNull(),
    token: varchar('token', { length: 255 }).unique().notNull(),
    expiresAt: datetime('expires_at').notNull(),
    revoked: boolean('revoked').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    accountIdx: index('idx_refresh_token_account').on(table.accountId),
    tokenIdx: index('idx_refresh_token_token').on(table.token),
  }),
);

export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
  account: one(account, {
    fields: [refreshToken.accountId],
    references: [account.id],
  }),
}));

export type RefreshToken = typeof refreshToken.$inferSelect;
export type NewRefreshToken = typeof refreshToken.$inferInsert;
