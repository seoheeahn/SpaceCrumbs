import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMbtiResultSchema, loginSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/mbti-results", async (req, res) => {
    try {
      const data = insertMbtiResultSchema.parse(req.body);
      const result = await storage.createMbtiResult(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/mbti-results/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.getMbtiResult(id);

    if (!result) {
      res.status(404).json({ error: "Result not found" });
      return;
    }

    res.json(result);
  });

  app.post("/api/mbti-results/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await storage.getMbtiResultByCredentials(data.nickname, data.password);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}