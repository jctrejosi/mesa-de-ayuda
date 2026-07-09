import {
  mysqlTable,
  bigint,
  varchar,
  decimal,
  int,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const inventory = mysqlTable('inventory', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique().notNull(),
  plu: varchar('plu', { length: 20 }),
  ean: varchar('ean', { length: 50 }),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  precio_venta: decimal('precio_venta', {
    precision: 15,
    scale: 2,
    mode: 'number',
  }).notNull(),
  saldo: int('saldo').default(0).notNull(),
  imagen: varchar('imagen', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
