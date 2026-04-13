import mongoose from "mongoose";
import {
  CalendarEntry,
  CALENDAR_MEAL_TYPES,
  type CalendarMealType,
} from "../models/calendar-entry.model.js";
import { Recipe } from "../models/recipe.model.js";
import type {
  ApiError,
  CalendarEntrySlot,
  CalendarWeekResponse,
  UpsertCalendarEntryInput,
} from "../types/index.js";

// ── Helpers ────────────────────────────────────────────────────

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseDateUtc(dateStr: string): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const error: ApiError = new Error(`Invalid date: ${dateStr}`);
    error.statusCode = 400;
    throw error;
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function buildEmptyDay(): Record<CalendarMealType, CalendarEntrySlot | null> {
  return { breakfast: null, lunch: null, dinner: null };
}

// ── Service functions ──────────────────────────────────────────

/**
 * Returns a full week of calendar assignments (Sunday–Saturday).
 * week_start_date must be a Sunday (UTC).
 */
export async function getCalendarWeek(
  userId: string,
  weekStartDateStr: string
): Promise<CalendarWeekResponse> {
  const sunday = parseDateUtc(weekStartDateStr);

  if (sunday.getUTCDay() !== 0) {
    const error: ApiError = new Error("week_start_date must be a Sunday");
    error.statusCode = 400;
    throw error;
  }

  // Build 7 dates: Sun through Sat
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setUTCDate(sunday.getUTCDate() + i);
    return d;
  });

  const saturday = weekDates[6];

  const entries = await CalendarEntry.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: sunday, $lte: saturday },
  }).populate<{
    recipeId: {
      _id: mongoose.Types.ObjectId;
      title: string;
      description: string;
      imageUrl?: string;
      cookingTime: number;
    };
  }>("recipeId", "title description imageUrl cookingTime");

  const days: CalendarWeekResponse["days"] = {};

  for (const date of weekDates) {
    const key = toIsoDate(date);
    days[key] = buildEmptyDay();

    for (const mealType of CALENDAR_MEAL_TYPES) {
      const entry = entries.find(
        (e) => toIsoDate(e.date) === key && e.mealType === mealType
      );
      if (entry && entry.recipeId) {
        days[key][mealType] = {
          entryId: entry._id.toString(),
          recipeId: entry.recipeId._id.toString(),
          title: entry.recipeId.title,
          description: entry.recipeId.description ?? "",
          imageUrl: entry.recipeId.imageUrl ?? "",
          cookingTime: entry.recipeId.cookingTime ?? 0,
          notes: entry.notes ?? "",
        };
      }
    }
  }

  return {
    weekStartDate: toIsoDate(sunday),
    days,
  };
}

/**
 * Assigns recipe to a specific date/meal slot.
 * Uses findOneAndUpdate with upsert so calling it twice for the same slot
 * simply swaps the recipe rather than throwing a conflict.
 */
export async function upsertCalendarEntry(
  input: UpsertCalendarEntryInput
): Promise<CalendarEntrySlot> {
  const { userId, dateStr, mealType, recipeId, notes } = input;

  if (!CALENDAR_MEAL_TYPES.includes(mealType)) {
    const error: ApiError = new Error(
      "mealType must be one of: breakfast, lunch, dinner"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    const error: ApiError = new Error("Invalid recipe ID");
    error.statusCode = 400;
    throw error;
  }

  const date = parseDateUtc(dateStr);

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

  const entry = await CalendarEntry.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      date,
      mealType,
    },
    {
      recipeId: new mongoose.Types.ObjectId(recipeId),
      ...(notes !== undefined && { notes }),
    },
    { upsert: true, new: true }
  );

  return {
    entryId: entry._id.toString(),
    recipeId: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description ?? "",
    imageUrl: recipe.imageUrl ?? "",
    cookingTime: recipe.cookingTime ?? 0,
    notes: entry.notes ?? "",
  };
}

/**
 * Clears the assigned recipe from a specific date + meal slot.
 */
export async function removeCalendarEntry(input: {
  userId: string;
  dateStr: string;
  mealType: CalendarMealType;
}): Promise<void> {
  const { userId, dateStr, mealType } = input;

  if (!CALENDAR_MEAL_TYPES.includes(mealType)) {
    const error: ApiError = new Error(
      "mealType must be one of: breakfast, lunch, dinner"
    );
    error.statusCode = 400;
    throw error;
  }

  const date = parseDateUtc(dateStr);

  const result = await CalendarEntry.findOneAndDelete({
    userId: new mongoose.Types.ObjectId(userId),
    date,
    mealType,
  });

  if (!result) {
    const error: ApiError = new Error("Calendar entry not found");
    error.statusCode = 404;
    throw error;
  }
}
