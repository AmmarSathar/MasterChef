import mongoose from "mongoose";
import { MealPlan } from "../models/meal-plan.model.js";
import { MealPlanEntry } from "../models/meal-plan-entry.model.js";
import { Recipe } from "../models/recipe.model.js";
import { dayOfWeekValues, mealTypeValues } from "@masterchef/shared/constants";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";
import type { ApiError, CreateMealPlanInput, MealPlanResponse, CreateMealPlanEntryInput, MealPlanEntryResponse } from "../types/index.js";

export async function createMealPlan(input: CreateMealPlanInput): Promise<MealPlanResponse> {
  const { userId, weekStartDate: weekStartDateStr } = input;

  const weekStartDate = new Date(weekStartDateStr);
  if (isNaN(weekStartDate.getTime())) {
    const error: ApiError = new Error("Invalid week_start_date");
    error.statusCode = 400;
    throw error;
  }

  if (weekStartDate.getUTCDay() !== 1) {
    const error: ApiError = new Error("week_start_date must be a Monday");
    error.statusCode = 400;
    throw error;
  }

  // Normalize to midnight UTC
  weekStartDate.setUTCHours(0, 0, 0, 0);

  const existing = await MealPlan.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    weekStartDate,
  });
  if (existing) {
    const error: ApiError = new Error("A meal plan for this week already exists");
    error.statusCode = 409;
    throw error;
  }

  const mealPlan = await MealPlan.create({
    userId: new mongoose.Types.ObjectId(userId),
    weekStartDate,
  });

  return getMealPlanById(mealPlan._id.toString());
}

export async function getMealPlanById(id: string): Promise<MealPlanResponse> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error: ApiError = new Error("Invalid meal plan ID");
    error.statusCode = 400;
    throw error;
  }

  const mealPlan = await MealPlan.findById(id);
  if (!mealPlan) {
    const error: ApiError = new Error("Meal plan not found");
    error.statusCode = 404;
    throw error;
  }

  const entries = await MealPlanEntry.find({ mealPlanId: id }).populate<{
    recipeId: { _id: mongoose.Types.ObjectId; title: string };
  }>("recipeId", "title");

  const days = {} as MealPlanResponse["days"];

  for (const day of dayOfWeekValues) {
    days[day] = {} as Record<MealType, MealPlanResponse["days"][DayOfWeek][MealType]>;
    for (const meal of mealTypeValues) {
      const entry = entries.find(
        (e) => e.dayOfWeek === day && e.mealType === meal
      );
      if (entry && entry.recipeId) {
        days[day][meal] = {
          recipeId: entry.recipeId._id.toString(),
          title: entry.recipeId.title,
          notes: entry.notes ?? "",
        };
      } else {
        days[day][meal] = null;
      }
    }
  }

  return {
    id: mealPlan._id.toString(),
    weekStartDate: mealPlan.weekStartDate,
    days,
  };
}

export async function createMealPlanEntry(
  input: CreateMealPlanEntryInput
): Promise<MealPlanEntryResponse> {
  const { mealPlanId, userId, dayOfWeek, mealType, recipeId, notes } = input;

  if (!mongoose.Types.ObjectId.isValid(mealPlanId)) {
    const error: ApiError = new Error("Invalid meal plan ID");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    const error: ApiError = new Error("Invalid recipe ID");
    error.statusCode = 400;
    throw error;
  }

  const mealPlan = await MealPlan.findById(mealPlanId);
  if (!mealPlan) {
    const error: ApiError = new Error("Meal plan not found");
    error.statusCode = 404;
    throw error;
  }

  if (mealPlan.userId.toString() !== userId) {
    const error: ApiError = new Error("You do not own this meal plan");
    error.statusCode = 403;
    throw error;
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error: ApiError = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }

  if (recipe.createdBy.toString() !== userId && !recipe.isPublic) {
    const error: ApiError = new Error("You do not have access to this recipe");
    error.statusCode = 403;
    throw error;
  }

  try {
    const entry = await MealPlanEntry.create({
      mealPlanId,
      dayOfWeek,
      mealType,
      recipeId,
      notes,
    });

    return {
      id: entry._id.toString(),
      mealPlanId: entry.mealPlanId.toString(),
      dayOfWeek: entry.dayOfWeek,
      mealType: entry.mealType,
      recipeId: entry.recipeId.toString(),
      notes: entry.notes,
      createdAt: entry.createdAt.toISOString(),
    };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      const error: ApiError = new Error(
        "A recipe is already assigned to this slot"
      );
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}
