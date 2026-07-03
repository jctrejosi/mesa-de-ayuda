import {
  mysqlTable,
  bigint,
  varchar,
  text,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { company } from './company.schema';

export const department = mysqlTable(
  'department',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    companyId: bigint('company_id', { mode: 'number' }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
  },
  (table) => ({
    companyIdx: index('idx_department_company').on(table.companyId),
  }),
);

export const departmentRelations = relations(department, ({ one }) => ({
  company: one(company, {
    fields: [department.companyId],
    references: [company.id],
  }),
}));

export type Department = typeof department.$inferSelect;
export type NewDepartment = typeof department.$inferInsert;
