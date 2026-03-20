import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// User types
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  userId: string;
  pfp?: string;
  age?: number;
  birth?: string;
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
  cuisines_pref?: string[];
  isCustomized?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  pfp?: string;
  age?: number;
  birth?: string;
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: string;
  cuisines_pref?: string[];
  isCustomized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Recipe types ──────────────────────────────────────────────

export interface IngredientInput {
  foodItem: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  ingredients: IngredientInput[];
  steps: string[];
  cookingTime: number;
  servings: number;
  skillLevel: string;
  cuisine?: string;
  imageUrl?: string;
  userId: string;
}

export interface UpdateRecipeInput {
  recipeId: string;
  userId: string;
  title?: string;
  description?: string;
  ingredients?: IngredientInput[];
  steps?: string[];
  cookingTime?: number;
  servings?: number;
  skillLevel?: string;
  cuisine?: string;
  imageUrl?: string;
  dietaryTags?: string[];
  containsAllergens?: string[];
}

export interface RecipeResponse {
  id: string;
  title: string;
  description: string;
  ingredients: IngredientInput[];
  steps: string[];
  cookingTime: number;
  servings: number;
  skillLevel: string;
  cuisine?: string;
  imageUrl?: string;
  dietaryTags: string[];
  containsAllergens: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeQueryInput {
  page?: number;
  limit?: number;
  skillLevel?: string;
  difficulty?: string;
  cuisine?: string;
  excludeTags?: string[];
  excludeAllergens?: string[];
  createdBy?: string;
  search?: string;
  max_time?: number;
  dietary_tags?: string[];
}

export interface RecommendationInput {
  availableIngredients: string[];
  userId?: string;
  limit?: number;
  page?: number;
}

export interface RecommendationResult {
  recipe: RecipeResponse;
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
  missingIngredients: string[];
}

// ── Meal Plan types ────────────────────────────────────────────

import type { DayOfWeek, MealType } from "@masterchef/shared/constants";

export interface MealSlot {
  recipeId: string;
  title: string;
  notes: string;
}

export interface CreateMealPlanInput {
  userId: string;
  weekStartDate: string;
}

export interface MealPlanResponse {
  id: string;
  weekStartDate: Date;
  days: Record<DayOfWeek, Record<MealType, MealSlot | null>>;
}

export interface CreateMealPlanEntryInput {
  mealPlanId: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId: string;
  notes?: string;
}

export interface MealPlanEntryResponse {
  id: string;
  mealPlanId: string;
  dayOfWeek: string;
  mealType: string;
  recipeId: string;
  notes?: string;
  createdAt: string;
}
