import { mbtiResults, type MbtiResult, type InsertMbtiResult } from "@shared/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";

export interface IStorage {
  createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult>;
  getMbtiResult(id: number): Promise<MbtiResult | undefined>;
  getMbtiResultByCredentials(userId: string, password: string): Promise<MbtiResult | undefined>;
  checkDuplicateUserId(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult> {
    const [newResult] = await db.insert(mbtiResults).values(result).returning();
    return newResult;
  }

  async getMbtiResult(id: number): Promise<MbtiResult | undefined> {
    const [result] = await db.select().from(mbtiResults).where(eq(mbtiResults.id, id));
    return result;
  }

  async getMbtiResultByCredentials(userId: string, password: string): Promise<MbtiResult | undefined> {
    const [result] = await db
      .select()
      .from(mbtiResults)
      .where(and(
        eq(mbtiResults.userId, userId),
        eq(mbtiResults.password, password)
      ));
    return result;
  }

  async checkDuplicateUserId(userId: string): Promise<boolean> {
    const [result] = await db
      .select({ id: mbtiResults.id })
      .from(mbtiResults)
      .where(eq(mbtiResults.userId, userId));
    return !!result;
  }
}

export const storage = new DatabaseStorage();