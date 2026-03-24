import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import { createMealPlan, getMealPlanById, createMealPlanEntry, deleteMealPlanEntry } from "../controllers/meal-plan.controller.js";
import { createMealPlan, getMealPlanById, createMealPlanEntry, updateMealPlanEntry } from "../controllers/meal-plan.controller.js";

const router = Router();

router.post("/", requireSession, createMealPlan);
router.get("/:id", requireSession, getMealPlanById);
router.post("/:id/entries", requireSession, createMealPlanEntry);
router.delete("/entries/:id", requireSession, deleteMealPlanEntry);
router.put("/entries/:id", requireSession, updateMealPlanEntry);

export default router;
