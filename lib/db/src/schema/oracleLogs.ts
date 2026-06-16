import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const oracleLogsTable = pgTable("oracle_logs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOracleLogSchema = createInsertSchema(oracleLogsTable).omit({ id: true, createdAt: true });
export type InsertOracleLog = z.infer<typeof insertOracleLogSchema>;
export type OracleLog = typeof oracleLogsTable.$inferSelect;
