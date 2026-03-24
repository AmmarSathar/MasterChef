import { Request, Response, NextFunction } from "express";
import { createMealPlan as createMealPlanService, getMealPlanById as getMealPlanByIdService, createMealPlanEntry as createMealPlanEntryService, deleteMealPlanEntry as deleteMealPlanEntryService } from "../services/meal-plan.service.js";
import { createMealPlan as createMealPlanService, getMealPlanById as getMealPlanByIdService, createMealPlanEntry as createMealPlanEntryService, updateMealPlanEntry as updateMealPlanEntryService } from "../services/meal-plan.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";
import type { ApiError } from "../types/index.js";

export async function createMealPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { week_start_date } = req.body as { week_start_date: string };
    const userId = (req as AuthenticatedRequest).session.user.id;

    if (!week_start_date) {
      res.status(400).json({ success: false, error: "week_start_date is required" });
      return;
    }

    const result = await createMealPlanService({ userId, weekStartDate: week_start_date });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMealPlanById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await getMealPlanByIdService(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createMealPlanEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const mealPlanId = req.params.id as string;
    const userId = (req as AuthenticatedRequest).session.user.id;
    const { day_of_week, meal_type, recipe_id, notes } = req.body as {
      day_of_week: DayOfWeek;
      meal_type: MealType;
      recipe_id: string;
      notes?: string;
    };

    const result = await createMealPlanEntryService({
      mealPlanId,
      userId,
      dayOfWeek: day_of_week,
      mealType: meal_type,
      recipeId: recipe_id,
      notes,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteMealPlanEntry(
export async function updateMealPlanEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const entryId = req.params.id as string;
    const userId = (req as AuthenticatedRequest).session.user.id;

    await deleteMealPlanEntryService({ entryId, userId });
    res.status(204).send();
    const userId = (req as AuthenticatedRequest).session.user.id;
    const id = req.params.id as string;
    const { recipe_id, notes } = req.body as { recipe_id: string; notes?: string };

    if (!recipe_id) {
      const error: ApiError = new Error("recipe_id is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await updateMealPlanEntryService({ entryId: id, userId, recipeId: recipe_id, notes });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
