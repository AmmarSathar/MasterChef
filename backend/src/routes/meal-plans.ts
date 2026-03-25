import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import { createMealPlan, getMealPlanById, getMealPlanByWeek, createMealPlanEntry, updateMealPlanEntry } from "../controllers/meal-plan.controller.js";

const router = Router();

router.post("/", requireSession, createMealPlan);
router.get("/", requireSession, getMealPlanByWeek);
router.get("/:id", requireSession, getMealPlanById);
router.post("/:id/entries", requireSession, createMealPlanEntry);
router.put("/entries/:id", requireSession, updateMealPlanEntry);

export default router;
