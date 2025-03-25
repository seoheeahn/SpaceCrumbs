import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMbtiResultSchema, insertUserSchema, loginSchema, adminLoginSchema, adminCreationSchema, mbtiResults } from "@shared/schema";
import { ZodError } from "zod";
import { analyzeMbtiResult } from "./openai";
import { calculateDimensionScores, calculateMbti } from "../client/src/lib/mbti";
import { eq, desc } from 'drizzle-orm';
import { db } from './db';

// Normalize each axis independently
function normalizeByAxis(x: number, y: number, z: number): [number, number, number] {
  // Calculate raw coordinates (-100 to 100 range)
  const rawX = x;
  const rawY = y;
  const rawZ = z;

  // Function to normalize a single value to 0-100 range
  const normalizeValue = (value: number) => {
    return ((value + 100) / 200) * 100;
  };

  return [
    normalizeValue(rawX),
    normalizeValue(rawY),
    normalizeValue(rawZ)
  ];
}

function calculateCoordinates(answers: { questionId: number; value: number }[]) {
  const scores = calculateDimensionScores(answers);

  // Calculate coordinates (-100 to 100 range)
  const x = ((scores.E - scores.I) / 100) * 100; // E/I axis
  const y = ((scores.N - scores.S) / 100) * 100; // N/S axis
  const z = ((scores.F - scores.T) / 100) * 100; // F/T axis

  // Normalize coordinates to 0-100 range
  return normalizeByAxis(x, y, z);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByCredentials(data.userId, data.password);

      if (!user) {
        res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Error in login:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "유효하지 않은 데이터입니다", details: error.errors });
      } else {
        res.status(500).json({ error: "서버 오류가 발생했습니다" });
      }
    }
  });

  // Get user's MBTI results
  app.get("/api/user/:userId/mbti-results", async (req, res) => {
    try {
      const { userId } = req.params;
      const results = await db
        .select()
        .from(mbtiResults)
        .where(eq(mbtiResults.userId, userId))
        .orderBy(desc(mbtiResults.createdAt));

      res.json(results);
    } catch (error) {
      console.error("Error getting user MBTI results:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  // Change user password
  app.post("/api/user/change-password", async (req, res) => {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        res.status(400).json({ error: "사용자 ID와 새 비밀번호를 입력해주세요" });
        return;
      }

      await storage.updateUserPassword(userId, newPassword);
      res.json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  // Create user and MBTI result
  app.post("/api/mbti-results", async (req, res) => {
    try {
      const userData = insertUserSchema.parse({
        userId: req.body.userId,
        password: req.body.password
      });

      const [x, y, z] = calculateCoordinates(req.body.answers);

      const mbtiResultData = insertMbtiResultSchema.parse({
        userId: userData.userId,
        answers: req.body.answers,
        result: req.body.result,
        language: req.body.language,
        coordinateX: x,
        coordinateY: y,
        coordinateZ: z
      });

      // First create the user
      await storage.createUser(userData);

      // Then create the MBTI result
      const result = await storage.createMbtiResult(mbtiResultData);
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

      // If the result exists and doesn't have analysis yet, generate it
      if (!result.analysis || !result.openaiRequestId) {
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
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error("Error getting MBTI result:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/mbti-results/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByCredentials(data.userId, data.password);

      if (!user) {
        res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
        return;
      }

      const result = await storage.getMbtiResult(user.id);
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

  app.get("/api/admin/mbti-results", async (req, res) => {
    try {
      const results = await storage.getAllMbtiResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching all MBTI results:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/admin/recalculate/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.getMbtiResult(id);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      // Recalculate MBTI type using the updated calculation logic
      const newMbtiType = calculateMbti(result.answers);

      // Update the result in database
      await storage.updateMbtiResult(id, { result: newMbtiType });

      // Return updated result
      const updatedResult = await storage.getMbtiResult(id);
      res.json(updatedResult);
    } catch (error) {
      console.error("Error recalculating MBTI result:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/admin/reanalyze/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.getMbtiResult(id);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      // Get new analysis from OpenAI
      const { analysis, requestId } = await analyzeMbtiResult(result);

      // Update the result in database
      await storage.updateMbtiResult(id, {
        analysis,
        openaiRequestId: requestId
      });

      // Return updated result
      const updatedResult = await storage.getMbtiResult(id);
      res.json(updatedResult);
    } catch (error) {
      console.error("Error reanalyzing MBTI result:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const data = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminUser(data.username);

      if (admin && admin.password === data.password) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "잘못된 관리자 계정입니다" });
      }
    } catch (error) {
      console.error("Error in admin login:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "유효하지 않은 데이터입니다", details: error.errors });
      } else {
        res.status(500).json({ error: "서버 오류가 발생했습니다" });
      }
    }
  });

  app.post("/api/admin/create", async (req, res) => {
    try {
      const data = adminCreationSchema.parse(req.body);

      // Check if admin already exists
      const existingAdmin = await storage.getAdminUser(data.username);
      if (existingAdmin) {
        res.status(400).json({ error: "이미 존재하는 관리자 계정입니다" });
        return;
      }

      await storage.createAdminUser(data);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating admin user:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "유효하지 않은 데이터입니다", details: error.errors });
      } else {
        res.status(500).json({ error: "서버 오류가 발생했습니다" });
      }
    }
  });

  app.get("/api/admin/mbti-results/:id/credentials", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.getMbtiResult(id);

      if (!result) {
        res.status(404).json({ error: "결과를 찾을 수 없습니다" });
        return;
      }

      const user = await storage.getUserByCredentials(result.userId, "");
      if (!user) {
        res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
        return;
      }

      res.json({
        userId: user.userId,
        password: user.password
      });
    } catch (error) {
      console.error("Error getting MBTI result credentials:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  // Update user password
  app.post("/api/admin/users/:userId/update-password", async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || typeof newPassword !== "string") {
        res.status(400).json({ error: "새 비밀번호를 입력해주세요" });
        return;
      }

      await storage.updateUserPassword(userId, newPassword);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}