import axios from "axios";

const BASE = import.meta.env.VITE_BASE_API_URL as string;
const cfg = { withCredentials: true } as const;

// ── Types ─────────────────────────────────────────────────────

export type CalendarMealType = "breakfast" | "lunch" | "dinner";

export type CalendarSlotEntry = {
  entryId: string;
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  notes: string;
};

export type CalendarDayData = Record<CalendarMealType, CalendarSlotEntry | null>;

export type CalendarWeekData = {
  weekStartDate: string; // YYYY-MM-DD (always a Sunday)
  days: Record<string, CalendarDayData>; // keyed by YYYY-MM-DD
};

// ── Helpers ───────────────────────────────────────────────────

/** Returns the ISO date string (YYYY-MM-DD) of the Sunday of a given date's week. */
export function toSundayIso(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // getDay() = 0 for Sunday
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function emptyCalendarDay(): CalendarDayData {
  return { breakfast: null, lunch: null, dinner: null };
}

// ── API functions ─────────────────────────────────────────────

/**
 * Fetches the full Sun–Sat week of calendar assignments.
 * @param sundayIso YYYY-MM-DD of a Sunday.
 */
export async function fetchCalendarWeek(sundayIso: string): Promise<CalendarWeekData> {
  const res = await axios.get(`${BASE}/calendar/week/${sundayIso}`, cfg);
  return res.data.data as CalendarWeekData;
}

/**
 * Assigns (or replaces) a recipe in a specific date + meal slot.
 */
export async function assignCalendarEntry(
  dateStr: string,
  mealType: CalendarMealType,
  recipeId: string,
  notes?: string,
): Promise<CalendarSlotEntry> {
  const res = await axios.put(
    `${BASE}/calendar/${dateStr}/${mealType}`,
    { recipe_id: recipeId, notes },
    cfg,
  );
  return res.data.data as CalendarSlotEntry;
}

/**
 * Clears the assigned recipe from a specific date + meal slot.
 */
export async function clearCalendarEntry(
  dateStr: string,
  mealType: CalendarMealType,
): Promise<void> {
  await axios.delete(`${BASE}/calendar/${dateStr}/${mealType}`, cfg);
}
