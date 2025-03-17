import { mbtiResults, type MbtiResult, type InsertMbtiResult } from "@shared/schema";

export interface IStorage {
  createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult>;
  getMbtiResult(id: number): Promise<MbtiResult | undefined>;
}

export class MemStorage implements IStorage {
  private results: Map<number, MbtiResult>;
  private currentId: number;

  constructor() {
    this.results = new Map();
    this.currentId = 1;
  }

  async createMbtiResult(result: InsertMbtiResult): Promise<MbtiResult> {
    const id = this.currentId++;
    const mbtiResult: MbtiResult = { ...result, id };
    this.results.set(id, mbtiResult);
    return mbtiResult;
  }

  async getMbtiResult(id: number): Promise<MbtiResult | undefined> {
    return this.results.get(id);
  }
}

export const storage = new MemStorage();
