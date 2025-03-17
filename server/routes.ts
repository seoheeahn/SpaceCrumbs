import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMbtiResultSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { analyzeMbtiResult } from "./openai";
import { calculateDimensionScores } from "../client/src/lib/mbti";

function calculateCoordinates(answers: { questionId: number; value: number }[]) {
  const scores = calculateDimensionScores(answers);

  // Normalize scores to -100 to 100 range and ensure numeric values
  const x = Number(((scores.E - scores.I) / 100) * 100); // E/I axis
  const y = Number(((scores.N - scores.S) / 100) * 100); // N/S axis
  const z = Number(((scores.F - scores.T) / 100) * 100); // F/T axis

  return { x, y, z };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.post("/api/mbti-results", async (req, res) => {
    try {
      const data = insertMbtiResultSchema.parse(req.body);

      // Calculate 3D coordinates
      const coordinates = calculateCoordinates(data.answers);
      const resultWithCoordinates = {
        ...data,
        coordinateX: coordinates.x,
        coordinateY: coordinates.y,
        coordinateZ: coordinates.z,
      };

      const result = await storage.createMbtiResult(resultWithCoordinates);
      res.json(result);
    } catch (error) {
      console.error("Error creating MBTI result:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "유효하지 않은 데이터입니다", details: error.errors });
      } else {
        res.status(500).json({ error: "서버 오류가 발생했습니다" });
      }
    }
  });

  app.get("/api/mbti-results/:id", async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Fetching MBTI result for ID: ${req.params.id}`);
      const id = parseInt(req.params.id);
      const result = await storage.getMbtiResult(id);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      // If analysis already exists, return it immediately
      if (result.analysis && result.openaiRequestId) {
        console.log(`[${new Date().toISOString()}] Returning cached analysis for result ID: ${id}`);
        res.json(result);
        return;
      }

      // Get AI analysis with timeout only if no analysis exists
      console.log(`[${new Date().toISOString()}] Starting OpenAI analysis for MBTI result`);
      const analysisPromise = analyzeMbtiResult(result);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI API timeout")), 30000)
      );

      try {
        const { analysis, requestId } = await Promise.race([analysisPromise, timeoutPromise]) as { analysis: string; requestId: string };
        console.log(`[${new Date().toISOString()}] OpenAI analysis completed successfully`);

        // Update the result with the analysis and request ID
        await storage.updateMbtiResult(id, { analysis, openaiRequestId: requestId });

        res.json({ ...result, analysis });
      } catch (error) {
        console.error("Error or timeout in OpenAI analysis:", error);
        // Return result without analysis if OpenAI call fails
        res.json({
          ...result,
          analysis: "AI 분석을 일시적으로 사용할 수 없습니다. 나중에 다시 시도해주세요."
        });
      }
    } catch (error) {
      console.error("Error getting MBTI result:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/mbti-results/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await storage.getMbtiResultByCredentials(data.userId, data.password);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      res.json(result);
    } catch (error) {
      console.error("Error logging in:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "유효하지 않은 데이터입니다", details: error.errors });
      } else {
        res.status(500).json({ error: "서버 오류가 발생했습니다" });
      }
    }
  });

  app.get("/api/check-user-id/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const isDuplicate = await storage.checkDuplicateUserId(userId);
      res.json({ isDuplicate });
    } catch (error) {
      console.error("Error checking user ID:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}