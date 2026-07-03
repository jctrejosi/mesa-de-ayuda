import { mysqlTable, bigint, varchar, text } from 'drizzle-orm/mysql-core';

export const setting = mysqlTable('setting', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  settingKey: varchar('setting_key', { length: 120 }).unique(),
  settingValue: text('setting_value'),
  settingType: varchar('setting_type', { length: 30 }),
  description: varchar('description', { length: 255 }),
});

export type Setting = typeof setting.$inferSelect;
export type NewSetting = typeof setting.$inferInsert;
