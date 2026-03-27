import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import {
  createMealPlan,
  getMealPlanById,
  createMealPlanEntry,
  deleteMealPlanEntry,
  updateMealPlanEntry,
} from "../controllers/meal-plan.controller.js";

const router = Router();

router.post("/", requireSession, createMealPlan);
router.get("/:id", requireSession, getMealPlanById);
router.post("/:id/entries", requireSession, createMealPlanEntry);
router.put("/entries/:id", requireSession, updateMealPlanEntry);
router.delete("/entries/:id", requireSession, deleteMealPlanEntry);

export default router;
