import {
  mysqlTable,
  bigint,
  varchar,
  date,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { person } from './person.schema';
import { branch } from './branch.schema';
import { department } from './department.schema';
import { position } from './position.schema';

export const employee = mysqlTable(
  'employee',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    personId: bigint('person_id', { mode: 'number' }).notNull(),
    employeeCode: varchar('employee_code', { length: 30 }).unique(),
    branchId: bigint('branch_id', { mode: 'number' }),
    departmentId: bigint('department_id', { mode: 'number' }),
    positionId: bigint('position_id', { mode: 'number' }),
    hireDate: date('hire_date'),
    terminationDate: date('termination_date'),
    status: mysqlEnum('status', [
      'ACTIVE',
      'INACTIVE',
      'VACATION',
      'SUSPENDED',
    ]).default('ACTIVE'),
  },
  (table) => ({
    personIdx: index('idx_employee_person').on(table.personId),
    branchIdx: index('idx_employee_branch').on(table.branchId),
    departmentIdx: index('idx_employee_department').on(table.departmentId),
    positionIdx: index('idx_employee_position').on(table.positionId),
  }),
);

export const employeeRelations = relations(employee, ({ one }) => ({
  person: one(person, {
    fields: [employee.personId],
    references: [person.id],
  }),
  branch: one(branch, {
    fields: [employee.branchId],
    references: [branch.id],
  }),
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  position: one(position, {
    fields: [employee.positionId],
    references: [position.id],
  }),
}));

export type Employee = typeof employee.$inferSelect;
export type NewEmployee = typeof employee.$inferInsert;
