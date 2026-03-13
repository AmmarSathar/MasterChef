import type { FoodTag } from "../constants/foods.js";
import type { SkillLevelValue } from "../constants/skill-levels.js";
import type { CuisineOption } from "../constants/cuisines.js";
import { DietaryOption } from "../constants/dietary.js";

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

export interface RecipeBase {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  cookingTime: number;
  prepTime: number;
  servings: number;
  skillLevel: SkillLevelValue;
  cuisine?: CuisineOption;
  imageUrl?: string;
}

/**
 * Payload for creating a recipe.
 */
export interface RecipeCreateInput extends RecipeBase {
  userId: string;
}

/**
 * Payload for updating a recipe.
 * Backend accepts partial updates, but requires recipeId + userId.
 */
export interface RecipeUpdateInput extends Partial<RecipeBase> {
  recipeId: string;
  userId: string;

  dietaryTags?: DietaryOption[];
  containsAllergens?: string[];
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
  prepingTime: number;
  servings: number;
  skillLevel: SkillLevelValue;
  cuisine?: CuisineOption;
  imageUrl?: string;

  /** Union of all ingredients' FoodTag[] — computed on create/update */
  dietaryTags: DietaryOption[];
  /** Union of all ingredients' contains[] — computed on create/update */
  containsAllergens: string[];

  createdBy: string;
  createdAt: Date;
  updatedAt ?: Date;
}

/**
 * @deprecated Use SkillLevelValue from shared/constants/skill-levels instead.
 */
export enum RecipeDifficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}
