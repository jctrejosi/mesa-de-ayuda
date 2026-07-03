import {
  mysqlTable,
  bigint,
  varchar,
  date,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const person = mysqlTable('person', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  documentType: varchar('document_type', { length: 10 }),
  documentNumber: varchar('document_number', { length: 30 }).unique(),
  firstName: varchar('first_name', { length: 80 }).notNull(),
  middleName: varchar('middle_name', { length: 80 }),
  lastName: varchar('last_name', { length: 80 }).notNull(),
  secondLastName: varchar('second_last_name', { length: 80 }),
  birthDate: date('birth_date'),
  gender: varchar('gender', { length: 20 }),
  email: varchar('email', { length: 150 }),
  personalEmail: varchar('personal_email', { length: 150 }),
  phone: varchar('phone', { length: 30 }),
  mobile: varchar('mobile', { length: 30 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 80 }),
  state: varchar('state', { length: 80 }),
  country: varchar('country', { length: 80 }),
  photo: varchar('photo', { length: 255 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Person = typeof person.$inferSelect;
export type NewPerson = typeof person.$inferInsert;
