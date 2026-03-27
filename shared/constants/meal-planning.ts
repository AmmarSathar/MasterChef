/**
 * Days of the week and meal types for the weekly meal planner.
 * Label = what the user sees (capitalized).
 * Value = what gets stored in MongoDB.
 *
 * DO NOT change the `value` fields without a database migration.
 */

// ── Days of the Week ────────────────────────────────────

export const DAYS_OF_WEEK = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
] as const;

/** The values stored in the database */
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]["value"];

/** The display labels shown in the UI */
export type DayOfWeekLabel = (typeof DAYS_OF_WEEK)[number]["label"];

/** Just the value strings, for mongoose enum and validation */
export const dayOfWeekValues = DAYS_OF_WEEK.map((d) => d.value) as DayOfWeek[];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthName = (typeof MONTH_NAMES)[number];
export const monthNameValues = [...MONTH_NAMES] as const satisfies MonthName[];

// ── Meal Types ──────────────────────────────────────────

export const MEAL_TYPES = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snack", value: "snack" },
] as const;

/** The values stored in the database */
export type MealType = (typeof MEAL_TYPES)[number]["value"];

/** The display labels shown in the UI */
export type MealTypeLabel = (typeof MEAL_TYPES)[number]["label"];

/** Just the value strings, for mongoose enum and validation */
export const mealTypeValues = MEAL_TYPES.map((m) => m.value) as MealType[];
