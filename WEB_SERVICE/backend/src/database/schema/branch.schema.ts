import {
  mysqlTable,
  bigint,
  varchar,
  decimal,
  int,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { company } from './company.schema';

export const branch = mysqlTable(
  'branch',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    companyId: bigint('company_id', { mode: 'number' }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    address: varchar('address', { length: 255 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    allowedRadius: int('allowed_radius').default(50),
    timezone: varchar('timezone', { length: 50 }),
    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    requireGeolocation: boolean('require_geolocation').default(true),
  },
  (table) => ({
    companyIdx: index('idx_branch_company').on(table.companyId),
  }),
);

export const branchRelations = relations(branch, ({ one }) => ({
  company: one(company, {
    fields: [branch.companyId],
    references: [company.id],
  }),
}));

export type Branch = typeof branch.$inferSelect;
export type NewBranch = typeof branch.$inferInsert;
