import {
  mysqlTable,
  bigint,
  varchar,
  bigint as bigintCol,
  timestamp,
  index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { account } from './account.schema';

export const file = mysqlTable(
  'file',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    originalName: varchar('original_name', { length: 255 }),
    storedName: varchar('stored_name', { length: 255 }),
    mimeType: varchar('mime_type', { length: 120 }),
    extension: varchar('extension', { length: 20 }),
    size: bigintCol('size', { mode: 'number' }),
    checksum: varchar('checksum', { length: 64 }),
    path: varchar('path', { length: 500 }),
    uploadedBy: bigint('uploaded_by', { mode: 'number' }),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  },
  (table) => ({
    uploadedByIdx: index('idx_file_uploaded_by').on(table.uploadedBy),
  }),
);

export const fileRelations = relations(file, ({ one }) => ({
  uploader: one(account, {
    fields: [file.uploadedBy],
    references: [account.id],
  }),
}));

export type File = typeof file.$inferSelect;
export type NewFile = typeof file.$inferInsert;
