import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tomesTable = pgTable("tomes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  sourceUrl: text("source_url"),
  featured: boolean("featured").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTomeSchema = createInsertSchema(tomesTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export type InsertTome = z.infer<typeof insertTomeSchema>;
export type Tome = typeof tomesTable.$inferSelect;
