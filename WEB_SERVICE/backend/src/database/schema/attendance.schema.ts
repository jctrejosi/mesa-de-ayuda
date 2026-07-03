/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  mysqlTable,
  bigint,
  mysqlEnum,
  decimal,
  double,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { employee } from './employee.schema';
import { branch } from './branch.schema';

export const attendance = mysqlTable(
  'attendance',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    employeeId: bigint('employee_id', { mode: 'number' }).notNull(),
    branchId: bigint('branch_id', { mode: 'number' }).notNull(),
    checkType: mysqlEnum('check_type', [
      'ENTRY',
      'EXIT',
      'BREAK_START',
      'BREAK_END',
    ]).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    accuracy: double('accuracy'),
    distance: double('distance'),
    ip: varchar('ip', { length: 60 }),
    device: varchar('device', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    employeeIdx: index('idx_att_employee').on(table.employeeId),
    branchIdx: index('idx_att_branch').on(table.branchId),
  }),
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employee, {
    fields: [attendance.employeeId],
    references: [employee.id],
  }),
  branch: one(branch, {
    fields: [attendance.branchId],
    references: [branch.id],
  }),
}));
