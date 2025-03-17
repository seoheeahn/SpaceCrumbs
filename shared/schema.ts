import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mbtiResults = pgTable("mbti_results", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  password: text("password").notNull(),
  answers: jsonb("answers").notNull(),
  result: text("result").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMbtiResultSchema = createInsertSchema(mbtiResults).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
});

export type InsertMbtiResult = z.infer<typeof insertMbtiResultSchema>;
export type MbtiResult = typeof mbtiResults.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;

export const mbtiTypes = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
] as const;

export type MbtiType = typeof mbtiTypes[number];