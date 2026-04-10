import axios from "axios";

const BASE = import.meta.env.VITE_BASE_API_URL as string;
const cfg = { withCredentials: true } as const;

// ── Types ─────────────────────────────────────────────────────

export type SlotName = "breakfast" | "lunch" | "dinner";

export type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealEntry = {
  entryId: string;
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  notes: string;
};

export type WeekDays = Record<DayName, Record<SlotName, MealEntry[]>>;

export type MealPlanData = {
  id: string;
  weekStartDate: Date;
  days: WeekDays;
};

// ── Helpers ───────────────────────────────────────────────────

/** Returns the ISO date string (YYYY-MM-DD) of the Monday of a given date's week. */
export function toMondayIso(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// ── API functions ─────────────────────────────────────────────

/**
 * Fetches (or creates) the meal plan for the week containing the given Monday.
 * @param mondayIso YYYY-MM-DD string of a Monday.
 */
export async function fetchMealPlanWeek(mondayIso: string): Promise<MealPlanData> {
  const res = await axios.get(`${BASE}/meal-plans/week/${mondayIso}`, cfg);
  return res.data.data as MealPlanData;
}

/**
 * Assigns a recipe to a specific (dayOfWeek, mealType) slot in a meal plan.
 * Returns the new entry's ID so the caller can construct a MealEntry immediately.
 */
export async function addMealPlanEntry(
  mealPlanId: string,
  entry: { dayOfWeek: DayName; mealType: SlotName; recipeId: string; notes?: string }
): Promise<{ entryId: string }> {
  const res = await axios.post(
    `${BASE}/meal-plans/${mealPlanId}/entries`,
    {
      day_of_week: entry.dayOfWeek,
      meal_type: entry.mealType,
      recipe_id: entry.recipeId,
      notes: entry.notes,
    },
    cfg
  );
  return { entryId: (res.data.data as { id: string }).id };
}

/**
 * Removes a meal plan entry by its ID.
 */
export async function removeMealPlanEntry(entryId: string): Promise<void> {
  await axios.delete(`${BASE}/meal-plans/entries/${entryId}`, cfg);
}
