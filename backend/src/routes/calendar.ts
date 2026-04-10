import { Router } from "express";
import { requireSession } from "../middleware/auth.middleware.js";
import {
  getCalendarWeek,
  upsertCalendarEntry,
  removeCalendarEntry,
} from "../controllers/calendar.controller.js";

const router = Router();

// GET  /api/calendar/week/:date   — fetch Sun–Sat week (:date = Sunday, YYYY-MM-DD)
router.get("/week/:date", requireSession, getCalendarWeek);

// PUT  /api/calendar/:date/:mealType   — assign or replace a meal slot
router.put("/:date/:mealType", requireSession, upsertCalendarEntry);

// DELETE /api/calendar/:date/:mealType — clear a meal slot
router.delete("/:date/:mealType", requireSession, removeCalendarEntry);

export default router;
