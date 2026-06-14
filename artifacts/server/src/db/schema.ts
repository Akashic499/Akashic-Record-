import {
  pgTable,
  text,
  serial,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Records table (example - customize based on your needs)
export const records = pgTable('records', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertRecordSchema = createInsertSchema(records);
export const selectRecordSchema = createSelectSchema(records);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Record = typeof records.$inferSelect;
export type InsertRecord = typeof records.$inferInsert;
