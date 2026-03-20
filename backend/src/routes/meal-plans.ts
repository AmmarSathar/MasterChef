import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import { getMealPlanById, createMealPlanEntry } from "../controllers/meal-plan.controller.js";

const router = Router();

router.get("/:id", requireSession, getMealPlanById);
router.post("/:id/entries", requireSession, createMealPlanEntry);

export default router;
