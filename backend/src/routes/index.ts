import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import recipeRoutes from "./recipes.js";
import mealPlanRoutes from "./meal-plans.js";
import calendarRoutes from "./calendar.js";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount route modules
router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);   // profile update lives here, outside /api/auth/*
router.use("/api/recipes", recipeRoutes);
router.use("/api/meal-plans", mealPlanRoutes);
router.use("/api/calendar", calendarRoutes);

export default router;
