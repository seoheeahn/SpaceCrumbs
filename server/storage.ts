import { users, mbtiResults, adminUsers, type User, type MbtiResult, type InsertUser, type InsertMbtiResult, type CreateAdminInput } from "@shared/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByCredentials(userId: string, password: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  checkDuplicateUserId(userId: string): Promise<boolean>;
  createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult>;
  getMbtiResult(id: number): Promise<MbtiResult | undefined>;
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
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByCredentials(userId: string, password: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.userId, userId),
        eq(users.password, password)
      ));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.userId, userId));
  }

  async checkDuplicateUserId(userId: string): Promise<boolean> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userId, userId));
    return !!user;
  }

  async createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult> {
    const [newResult] = await db.insert(mbtiResults).values(result).returning();
    return newResult;
  }

  async getMbtiResult(id: number): Promise<MbtiResult | undefined> {
    // Join users and mbti_results tables to get complete result
    const [result] = await db
      .select({
        id: mbtiResults.id,
        userId: mbtiResults.userId,
        answers: mbtiResults.answers,
        result: mbtiResults.result,
        language: mbtiResults.language,
        openaiRequestId: mbtiResults.openaiRequestId,
        analysis: mbtiResults.analysis,
        coordinateX: mbtiResults.coordinateX,
        coordinateY: mbtiResults.coordinateY,
        coordinateZ: mbtiResults.coordinateZ,
        createdAt: mbtiResults.createdAt
      })
      .from(mbtiResults)
      .innerJoin(users, eq(users.userId, mbtiResults.userId))
      .where(eq(mbtiResults.id, id));

    return result;
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
          db.sql`mbtiResults.coordinateX IS NOT NULL`,
          db.sql`mbtiResults.coordinateY IS NOT NULL`,
          db.sql`mbtiResults.coordinateZ IS NOT NULL`,
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