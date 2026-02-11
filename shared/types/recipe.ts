import type { FoodTag } from "../constants/foods.js";
import type { SkillLevelValue } from "../constants/skill-levels.js";
import type { CuisineOption } from "../constants/cuisines.js";

/**
 * A single ingredient in a recipe.
 * `foodItem` should match a name from the shared foods[] array when possible.
 * Custom ingredients (not in foods[]) are allowed but contribute no dietary tags.
 */
export interface Ingredient {
  foodItem: string;
  amount: number;
  unit: string;
  notes?: string;
}

/**
 * The main Recipe type shared across frontend and backend.
 */
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  cookingTime: number;
  servings: number;
  skillLevel: SkillLevelValue;
  cuisine?: CuisineOption;
  imageUrl?: string;

  /** Union of all ingredients' FoodTag[] — computed on create/update */
  dietaryTags: FoodTag[];
  /** Union of all ingredients' contains[] — computed on create/update */
  containsAllergens: string[];

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @deprecated Use SkillLevelValue from shared/constants/skill-levels instead.
 */
export enum RecipeDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}
