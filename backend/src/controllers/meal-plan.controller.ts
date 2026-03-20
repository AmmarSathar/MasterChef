import { Request, Response, NextFunction } from "express";
import { getMealPlanById as getMealPlanByIdService, createMealPlanEntry as createMealPlanEntryService } from "../services/meal-plan.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";

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
