import {
  mysqlTable,
  bigint,
  varchar,
  text,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { company } from './company.schema';

export const position = mysqlTable(
  'position',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    companyId: bigint('company_id', { mode: 'number' }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
  },
  (table) => ({
    companyIdx: index('idx_position_company').on(table.companyId),
  }),
);

export const positionRelations = relations(position, ({ one }) => ({
  company: one(company, {
    fields: [position.companyId],
    references: [company.id],
  }),
}));

export type Position = typeof position.$inferSelect;
export type NewPosition = typeof position.$inferInsert;
