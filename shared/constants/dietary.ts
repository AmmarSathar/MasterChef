import type { FoodTag } from "./foods.js";

/**
 * Each dietary restriction maps to the food tags it excludes.
 * This is the SINGLE SOURCE OF TRUTH for:
 *   1. Which dietary options exist (used in the frontend dropdown)
 *   2. Which food tags each diet forbids (used in recipe filtering)
 */
export const dietaryExclusions = {
  Vegan:         ["meat", "poultry", "pork", "seafood", "fish", "shellfish", "dairy", "eggs", "animal-product", "gelatin"],
  Vegetarian:    ["meat", "poultry", "pork", "seafood", "fish", "shellfish"],
  Pescatarian:   ["meat", "poultry", "pork"],
  Halal:         ["pork", "alcohol", "gelatin"],
  Kosher:        ["pork", "shellfish"],
  Keto:          ["high-carb"],
  Paleo:         ["grain", "legume", "dairy", "processed"],
  "Gluten-Free": ["gluten"],
  "Dairy-Free":  ["dairy"],
} as const satisfies Record<string, readonly FoodTag[]>;

/** Union type of all valid dietary option strings */
export type DietaryOption = keyof typeof dietaryExclusions;

/** Array of all dietary option strings, for UI dropdowns and validation */
export const dietaryOptions = Object.keys(dietaryExclusions) as DietaryOption[];
