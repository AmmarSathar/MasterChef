import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import { getMealPlanById } from "../controllers/meal-plan.controller.js";

const router = Router();

router.get("/:id", requireSession, getMealPlanById);

export default router;
