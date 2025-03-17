import { mbtiResults, adminUsers, type MbtiResult, type InsertMbtiResult, type CreateAdminInput } from "@shared/schema";
import { db } from "./db";
import { and, eq, isNotNull } from "drizzle-orm";

export interface IStorage {
  createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult>;
  getMbtiResult(id: number): Promise<MbtiResult | undefined>;
  getMbtiResultByCredentials(userId: string, password: string): Promise<MbtiResult | undefined>;
  checkDuplicateUserId(userId: string): Promise<boolean>;
  updateMbtiResult(id: number, update: { analysis?: string; openaiRequestId?: string; result?: string }): Promise<void>;
  getAllUserCoordinates(): Promise<Array<{
    id: number;
    userId: string;
    coordinateX: number | null;
    coordinateY: number | null;
    coordinateZ: number | null;
  }>>;
  getAllMbtiResults(): Promise<MbtiResult[]>;
  createAdminUser(admin: CreateAdminInput): Promise<void>;
  getAdminUser(username: string): Promise<{ id: number; username: string; password: string } | undefined>;
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

  async updateMbtiResult(id: number, update: { analysis?: string; openaiRequestId?: string; result?: string }): Promise<void> {
    await db
      .update(mbtiResults)
      .set(update)
      .where(eq(mbtiResults.id, id));
  }

  async getAllUserCoordinates() {
    return await db
      .select({
        id: mbtiResults.id,
        userId: mbtiResults.userId,
        coordinateX: mbtiResults.coordinateX,
        coordinateY: mbtiResults.coordinateY,
        coordinateZ: mbtiResults.coordinateZ,
      })
      .from(mbtiResults)
      .where(
        and(
          isNotNull(mbtiResults.coordinateX),
          isNotNull(mbtiResults.coordinateY),
          isNotNull(mbtiResults.coordinateZ),
        )
      );
  }

  async getAllMbtiResults(): Promise<MbtiResult[]> {
    return await db
      .select()
      .from(mbtiResults)
      .orderBy(mbtiResults.createdAt);
  }

  async createAdminUser(admin: CreateAdminInput): Promise<void> {
    await db.insert(adminUsers).values(admin);
  }

  async getAdminUser(username: string): Promise<{ id: number; username: string; password: string } | undefined> {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return user;
  }
}

export const storage = new DatabaseStorage();

// Create initial admin user if it doesn't exist
async function initializeAdminUser() {
  const storage = new DatabaseStorage();
  const existingAdmin = await storage.getAdminUser("host");
  if (!existingAdmin) {
    await storage.createAdminUser({
      username: "host",
      password: "algobee"
    });
    console.log("Initial admin user created");
  }
}

initializeAdminUser().catch(console.error);