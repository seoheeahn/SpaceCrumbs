import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMbtiResultSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { analyzeMbtiResult } from "./openai";
import { calculateDimensionScores } from "../client/src/lib/mbti";

// Normalize each axis independently
function normalizeByAxis(x: number, y: number, z: number): [number, number, number] {
  const coordinates = [x, y, z];
  const xValues = [x];
  const yValues = [y];
  const zValues = [z];

  // Function to normalize a single value within its axis range
  const normalizeValue = (value: number, values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return ((value - min) / (max - min)) * 100;
  };

  return [
    normalizeValue(x, xValues),
    normalizeValue(y, yValues),
    normalizeValue(z, zValues)
  ];
}

function calculateCoordinates(answers: { questionId: number; value: number }[]) {
  const scores = calculateDimensionScores(answers);

  // Calculate raw coordinates (-100 to 100 range)
  const rawX = ((scores.E - scores.I) / 100) * 100; // E/I axis
  const rawY = ((scores.N - scores.S) / 100) * 100; // N/S axis
  const rawZ = ((scores.F - scores.T) / 100) * 100; // F/T axis

  // Normalize coordinates to 0-100 range
  return normalizeByAxis(rawX, rawY, rawZ);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.post("/api/mbti-results", async (req, res) => {
    try {
      const data = insertMbtiResultSchema.parse(req.body);

      // Calculate normalized 3D coordinates
      const [x, y, z] = calculateCoordinates(data.answers);
      const resultWithCoordinates = {
        ...data,
        coordinateX: x,
        coordinateY: y,
        coordinateZ: z,
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
      const id = parseInt(req.params.id);
      const result = await storage.getMbtiResult(id);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      if (result.analysis && result.openaiRequestId) {
        res.json(result);
        return;
      }

      try {
        const { analysis, requestId } = await analyzeMbtiResult(result);
        await storage.updateMbtiResult(id, { analysis, openaiRequestId: requestId });
        res.json({ ...result, analysis });
      } catch (error) {
        console.error("Error or timeout in OpenAI analysis:", error);
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