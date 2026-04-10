import { Request, Response, NextFunction } from "express";
import {
  getCalendarWeek as getCalendarWeekService,
  upsertCalendarEntry as upsertCalendarEntryService,
  removeCalendarEntry as removeCalendarEntryService,
} from "../services/calendar.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { CalendarMealType } from "../models/calendar-entry.model.js";
import type { ApiError } from "../types/index.js";

/**
 * GET /api/calendar/week/:date
 * :date must be a Sunday in YYYY-MM-DD format.
 * Returns all calendar assignments for that Sunday–Saturday week.
 */
export async function getCalendarWeek(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const weekStartDate = req.params.date as string;
    const userId = (req as AuthenticatedRequest).session.user.id;

    const result = await getCalendarWeekService(userId, weekStartDate);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/calendar/:date/:mealType
 * :date — specific day in YYYY-MM-DD format.
 * :mealType — breakfast | lunch | dinner.
 * Body: { recipe_id: string, notes?: string }
 * Creates or replaces the assignment for that slot.
 */
export async function upsertCalendarEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dateStr = req.params.date as string;
    const mealType = req.params.mealType as CalendarMealType;
    const userId = (req as AuthenticatedRequest).session.user.id;
    const { recipe_id, notes } = req.body as {
      recipe_id: string;
      notes?: string;
    };

    if (!recipe_id) {
      const error: ApiError = new Error("recipe_id is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await upsertCalendarEntryService({
      userId,
      dateStr,
      mealType,
      recipeId: recipe_id,
      notes,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/calendar/:date/:mealType
 * Clears the assigned recipe from that slot.
 */
export async function removeCalendarEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dateStr = req.params.date as string;
    const mealType = req.params.mealType as CalendarMealType;
    const userId = (req as AuthenticatedRequest).session.user.id;

    await removeCalendarEntryService({ userId, dateStr, mealType });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
