import type { FoodTag } from "./foods.js";
import { foods } from "./foods.js";
import { dietaryExclusions } from "./dietary.js";

/**
 * Given a food name, returns all allergens it contains (including itself).
 * Useful for recipe filtering: "Does this recipe conflict with user allergies?"
 */
export function getAllergens(foodName: string): string[] {
  const food = foods.find((f) => f.name === foodName);
  if (!food) return [foodName];
  return [food.name, ...(food.contains ?? [])];
}

/**
 * Check if a food conflicts with any of the user's allergies.
 * Returns true if the food IS one of the allergens or CONTAINS one.
 */
export function hasAllergenConflict(
  foodName: string,
  userAllergies: string[],
): boolean {
  if (userAllergies.length === 0) return false;
  const foodAllergens = getAllergens(foodName);
  return foodAllergens.some((a) => userAllergies.includes(a));
}

/**
 * Check if a food conflicts with any of the user's dietary restrictions.
 * Returns true if the food has a tag that is excluded by any of the user's diets.
 *
 * Example: hasDietaryConflict("Bacon", ["Halal"]) → true (tagged "pork")
 *          hasDietaryConflict("Gelatin", ["Halal"]) → true (tagged "gelatin")
 *          hasDietaryConflict("Rice", ["Vegan"]) → false
 */
export function hasDietaryConflict(
  foodName: string,
  userDiets: string[],
): boolean {
  if (userDiets.length === 0) return false;
  const food = foods.find((f) => f.name === foodName);
  if (!food) return false;

  const excludedTags: FoodTag[] = userDiets.flatMap(
    (diet) => [...(dietaryExclusions[diet as keyof typeof dietaryExclusions] ?? [])],
  );
  return food.tags.some((tag) => excludedTags.includes(tag));
}

/**
 * Full conflict check: combines allergen AND dietary restriction checks.
 * Use this when filtering recipes for a user.
 */
export function hasAnyConflict(
  foodName: string,
  userAllergies: string[],
  userDiets: string[],
): boolean {
  return (
    hasAllergenConflict(foodName, userAllergies) ||
    hasDietaryConflict(foodName, userDiets)
  );
}
