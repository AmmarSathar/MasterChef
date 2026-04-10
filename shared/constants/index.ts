// ── Foods ──────────────────────────────────────────────
export { foods, allFoodNames, foodCategories, foodsByCategory, allergenOptions } from "./foods.js";
export type { FoodItem, FoodCategory, FoodTag } from "./foods.js";

// ── Dietary ────────────────────────────────────────────
export { dietaryExclusions, dietaryOptions } from "./dietary.js";
export type { DietaryOption } from "./dietary.js";

// ── Cuisines ───────────────────────────────────────────
export { CUISINES, cuisineOptions } from "./cuisines.js";
export type { CuisineOption } from "./cuisines.js";

// ── Skill Levels ───────────────────────────────────────
export {
  SKILL_LEVELS,
  skillLevelValues,
  skillLevelLabels,
  skillLevelToValue,
  skillLevelToLabel,
} from "./skill-levels.js";
export type { SkillLevelValue, SkillLevelLabel } from "./skill-levels.js";

// ── Food Helpers ───────────────────────────────────────
export { getAllergens, hasAllergenConflict, hasDietaryConflict, hasAnyConflict } from "./food-helpers.js";

// ── UI Strings ─────────────────────────────────────────
export { SAD_KAOMOJIS } from "./ui-strings.js";
export type { NoResultsKaomoji } from "./ui-strings.js";
// ── Meal Planning ──────────────────────────────────────
export {
  DAYS_OF_WEEK,
  dayOfWeekValues,
  MEAL_TYPES,
  mealTypeValues,
  MONTH_NAMES,
  monthNameValues,
} from "./meal-planning.js";
export type { DayOfWeek, DayOfWeekLabel, MealType, MealTypeLabel } from "./meal-planning.js";
