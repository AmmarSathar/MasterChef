import mongoose from "mongoose";
import { MealPlan } from "../models/meal-plan.model.js";
import { MealPlanEntry } from "../models/meal-plan-entry.model.js";
import { dayOfWeekValues, mealTypeValues } from "@masterchef/shared/constants";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";
import type { ApiError, MealPlanResponse } from "../types/index.js";

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

export async function assertMealPlanAccess(mealPlanId: string, userId: string) {
  try {
    const mealPlan = await MealPlan.findById(mealPlanId);

    // 404: meal plan does not exist
    if (!mealPlan) {
      throw Object.assign(new Error("Meal plan not found"), {
        statusCode: 404,
      });
    }

    // 403: user is not the owner
    if (mealPlan.userId.toString() !== userId) {
      throw Object.assign(new Error("Forbidden"), {
        statusCode: 403,
      });
    }

    return mealPlan;
  } catch (error) {

    // If already one of our custom errors, rethrow it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    
    // Otherwise, treat as an unexpected server error
    throw Object.assign(new Error("Internal server error"), {
      statusCode: 500,
    });
  }
}