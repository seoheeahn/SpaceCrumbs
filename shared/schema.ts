import { pgTable, text, serial, integer, jsonb, timestamp, numeric } from "drizzle-orm/pg-core";
import { z } from "zod";

// Define Answer type and schema
export interface Answer {
  questionId: number;
  value: number;
}

export const answerSchema = z.object({
  questionId: z.number(),
  value: z.number().min(1).max(5),
});

export const mbtiResults = pgTable("mbti_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  password: text("password").notNull(),
  answers: jsonb("answers").$type<Answer[]>().notNull(),
  result: text("result").notNull(),
  language: text("language").notNull(),
  openaiRequestId: text("openai_request_id"),
  analysis: text("analysis"),
  coordinateX: numeric("coordinate_x"),
  coordinateY: numeric("coordinate_y"),
  coordinateZ: numeric("coordinate_z"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create a strict schema for input validation
export const insertMbtiResultSchema = z.object({
  userId: z.string()
    .min(4, "아이디는 최소 4자 이상이어야 합니다")
    .max(20, "아이디는 최대 20자까지 가능합니다")
    .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문자와 숫자만 사용할 수 있습니다"),
  password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
  answers: z.array(answerSchema),
  result: z.string(),
  language: z.string(),
  openaiRequestId: z.string().optional(),
  analysis: z.string().optional(),
  coordinateX: z.number().optional(),
  coordinateY: z.number().optional(),
  coordinateZ: z.number().optional(),
});

export const loginSchema = z.object({
  userId: z.string()
    .min(4, "아이디는 최소 4자 이상이어야 합니다")
    .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문자와 숫자만 사용할 수 있습니다"),
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

export const adminLoginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const adminCreationSchema = z.object({
  username: z.string()
    .min(4, "아이디는 최소 4자 이상이어야 합니다")
    .max(20, "아이디는 최대 20자까지 가능합니다")
    .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문자와 숫자만 사용할 수 있습니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateAdminInput = z.infer<typeof adminCreationSchema>;