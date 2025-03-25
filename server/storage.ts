import { users, mbtiResults, adminUsers, type User, type MbtiResult, type InsertUser, type InsertMbtiResult, type CreateAdminInput } from "@shared/schema";
import { db } from "./db";
import { and, eq, isNotNull } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByCredentials(userId: string, password: string): Promise<User | undefined>;
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
    const [result] = await db.select().from(mbtiResults).where(eq(mbtiResults.id, id));
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