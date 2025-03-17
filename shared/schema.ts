import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mbtiResults = pgTable("mbti_results", {
  id: serial("id").primaryKey(),
  answers: jsonb("answers").notNull(),
  result: text("result").notNull(),
  language: text("language").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertMbtiResultSchema = createInsertSchema(mbtiResults).omit({
  id: true,
});

export type InsertMbtiResult = z.infer<typeof insertMbtiResultSchema>;
export type MbtiResult = typeof mbtiResults.$inferSelect;

export const mbtiTypes = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
] as const;

export type MbtiType = typeof mbtiTypes[number];
