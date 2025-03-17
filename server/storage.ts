import { mbtiResults, type MbtiResult, type InsertMbtiResult } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult>;
  getMbtiResult(id: number): Promise<MbtiResult | undefined>;
  getMbtiResultByCredentials(nickname: string, password: string): Promise<MbtiResult | undefined>;
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

  async getMbtiResultByCredentials(nickname: string, password: string): Promise<MbtiResult | undefined> {
    const [result] = await db
      .select()
      .from(mbtiResults)
      .where(eq(mbtiResults.nickname, nickname))
      .where(eq(mbtiResults.password, password));
    return result;
  }
}

export const storage = new DatabaseStorage();