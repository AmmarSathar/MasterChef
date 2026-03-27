import { foods, dietaryExclusions } from "@masterchef/shared/constants";
import type { FoodTag } from "@masterchef/shared/constants";
import { Recipe } from "../models/recipe.model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import type {
  ApiError,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeResponse,
  RecipeQueryInput,
  RecommendationInput,
  RecommendationResult,
} from "../types/index.js";

// ── Helpers: compute tags from ingredients ─────────────────────

function computeDietaryTags(ingredientNames: string[]): string[] {
  const tagSet = new Set<string>();
  for (const name of ingredientNames) {
    const food = foods.find((f) => f.name === name);
    if (food) {
      food.tags.forEach((tag) => tagSet.add(tag));
    }
  }
  return Array.from(tagSet);
}

function computeAllergens(ingredientNames: string[]): string[] {
  const allergenSet = new Set<string>();
  for (const name of ingredientNames) {
    const food = foods.find((f) => f.name === name);
    if (food) {
      allergenSet.add(food.name);
      if (food.contains) {
        food.contains.forEach((a) => allergenSet.add(a));
      }
    }
  }
  return Array.from(allergenSet);
}

// ── Helper: convert document to response ───────────────────────

function toRecipeResponse(recipe: InstanceType<typeof Recipe>): RecipeResponse {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    skillLevel: recipe.skillLevel,
    cuisine: recipe.cuisine,
    imageUrl: recipe.imageUrl,
    dietaryTags: recipe.dietaryTags,
    containsAllergens: recipe.containsAllergens,
    isShared: recipe.isPublic ?? true,
    createdBy: recipe.createdBy.toString(),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

// ── CRUD ───────────────────────────────────────────────────────

export async function createRecipe(input: CreateRecipeInput): Promise<RecipeResponse> {
  const {
    title, description, ingredients, steps,
    cookingTime, servings, skillLevel, cuisine, imageUrl, isShared, userId,
  } = input;

  if (!title || !description || !ingredients?.length || !steps?.length
      || !cookingTime || !servings || !skillLevel) {
    const error: ApiError = new Error(
      "Title, description, ingredients, steps, cookingTime, servings, and skillLevel are required"
    );
    error.statusCode = 400;
    throw error;
  }

  for (const ing of ingredients) {
    if (!ing.foodItem || ing.amount == null || !ing.unit) {
      const error: ApiError = new Error(
        "Each ingredient must have foodItem, amount, and unit"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const ingredientNames = ingredients.map((i) => i.foodItem);
  const dietaryTags = computeDietaryTags(ingredientNames);
  const containsAllergens = computeAllergens(ingredientNames);

  const recipe = await Recipe.create({
    title,
    description,
    ingredients,
    steps,
    cookingTime,
    servings,
    skillLevel,
    cuisine,
    imageUrl,
    dietaryTags,
    containsAllergens,
    isPublic: isShared ?? true,
    createdBy: userId,
  });

  return toRecipeResponse(recipe);
}

export async function getRecipeById(recipeId: string): Promise<RecipeResponse> {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error: ApiError = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  return toRecipeResponse(recipe);
}

export async function getRecipes(query: RecipeQueryInput): Promise<{
  recipes: RecipeResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const {
    page = 1, limit = 20, skillLevel, difficulty, cuisine,
    excludeTags, excludeAllergens, createdBy, search,
    max_time, dietary_tags,
  } = query;

  const filter: Record<string, unknown> = {};

  // difficulty is an alias for skillLevel; difficulty takes precedence
  const resolvedSkillLevel = difficulty ?? skillLevel;
  if (resolvedSkillLevel) filter.skillLevel = resolvedSkillLevel;

  if (cuisine) filter.cuisine = cuisine;
  if (createdBy) filter.createdBy = createdBy;
  if (!createdBy) filter.isPublic = true;

  if (max_time) filter.cookingTime = { $lte: max_time };

  if (excludeTags?.length) {
    filter.dietaryTags = { $nin: excludeTags };
  }

  // dietary_tags: include recipes that have ALL the specified tags
  if (dietary_tags?.length) {
    filter.dietaryTags = { $all: dietary_tags };
  }

  if (excludeAllergens?.length) {
    filter.containsAllergens = { $nin: excludeAllergens };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const [recipes, total] = await Promise.all([
    Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(filter),
  ]);

  return {
    recipes: recipes.map(toRecipeResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function searchRecipes(input: {
  q: string;
  page?: number;
  limit?: number;
}): Promise<{
  recipes: RecipeResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { q, page = 1, limit = 20 } = input;

  if (!q?.trim()) {
    const error: ApiError = new Error("Search query q is required");
    error.statusCode = 400;
    throw error;
  }

  const regex = new RegExp(q.trim(), "i");
  const filter = {
    isPublic: true,
    $or: [
      { title: regex },
      { description: regex },
      { "ingredients.foodItem": regex },
    ],
  };

  const skip = (page - 1) * limit;
  const [recipes, total] = await Promise.all([
    Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(filter),
  ]);

  return {
    recipes: recipes.map(toRecipeResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateRecipe(input: UpdateRecipeInput): Promise<RecipeResponse> {
  const { recipeId, userId, ...updateData } = input;

  if (!recipeId) {
    const error: ApiError = new Error("Recipe ID is required");
    error.statusCode = 400;
    throw error;
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error: ApiError = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }

  if (recipe.createdBy.toString() !== userId) {
    const error: ApiError = new Error("You can only edit your own recipes");
    error.statusCode = 403;
    throw error;
  }

  // Recompute tags if ingredients changed
  if (updateData.ingredients?.length) {
    const ingredientNames = updateData.ingredients.map((i) => i.foodItem);
    updateData.dietaryTags = computeDietaryTags(ingredientNames);
    updateData.containsAllergens = computeAllergens(ingredientNames);
  }

  if (typeof updateData.isShared === "boolean") {
    (updateData as Record<string, unknown>).isPublic = updateData.isShared;
    delete (updateData as Record<string, unknown>).isShared;
  }

  const updated = await Recipe.findByIdAndUpdate(
    recipeId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const error: ApiError = new Error("Recipe not found after update");
    error.statusCode = 404;
    throw error;
  }

  return toRecipeResponse(updated);
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error: ApiError = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }

  if (recipe.createdBy.toString() !== userId) {
    const error: ApiError = new Error("You can only delete your own recipes");
    error.statusCode = 403;
    throw error;
  }

  await Recipe.findByIdAndDelete(recipeId);
}

// ── Recommendation Engine ──────────────────────────────────────

export async function getRecommendations(
  input: RecommendationInput
): Promise<RecommendationResult[]> {
  const { availableIngredients, userId, limit = 20, page = 1 } = input;

  if (!availableIngredients?.length) {
    const error: ApiError = new Error("At least one available ingredient is required");
    error.statusCode = 400;
    throw error;
  }

  // Fetch user preferences if userId provided
  let userDiets: string[] = [];
  let userAllergies: string[] = [];
  let userCuisines: string[] = [];

  if (userId) {
    const db = mongoose.connection.db;
    if (db) {
      const user = await db.collection("user").findOne({ _id: new ObjectId(userId) });
      if (user) {
        userDiets = (user.dietary_restric as string[]) ?? [];
        userAllergies = (user.allergies as string[]) ?? [];
        userCuisines = (user.cuisines_pref as string[]) ?? [];
      }
    }
  }

  // Convert dietary restrictions to excluded tags
  const excludedTags: FoodTag[] = userDiets.flatMap(
    (diet) => [...(dietaryExclusions[diet as keyof typeof dietaryExclusions] ?? [])]
  );

  // MongoDB filter: exclude conflicting recipes
  const filter: Record<string, unknown> = {};
  filter.isPublic = true;
  if (excludedTags.length) {
    filter.dietaryTags = { $nin: excludedTags };
  }
  if (userAllergies.length) {
    filter.containsAllergens = { $nin: userAllergies };
  }

  const candidates = await Recipe.find(filter);

  // Score each candidate by ingredient match
  const availableSet = new Set(
    availableIngredients.map((n) => n.toLowerCase())
  );

  const scored: RecommendationResult[] = candidates.map((recipe) => {
    const recipeIngredientNames = recipe.ingredients.map((i) => i.foodItem.toLowerCase());
    const totalIngredients = recipeIngredientNames.length;
    const matchedCount = recipeIngredientNames.filter((name) =>
      availableSet.has(name)
    ).length;
    const matchScore = totalIngredients > 0 ? matchedCount / totalIngredients : 0;

    const missingIngredients = recipe.ingredients
      .filter((i) => !availableSet.has(i.foodItem.toLowerCase()))
      .map((i) => i.foodItem);

    // 10% bonus for cuisine preference match
    let cuisineBonus = 0;
    if (recipe.cuisine && userCuisines.includes(recipe.cuisine)) {
      cuisineBonus = 0.1;
    }

    return {
      recipe: toRecipeResponse(recipe),
      matchScore: Math.min(matchScore + cuisineBonus, 1.0),
      matchedIngredients: matchedCount,
      totalIngredients,
      missingIngredients,
    };
  });

  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.missingIngredients.length - b.missingIngredients.length;
  });

  const skip = (page - 1) * limit;
  return scored.slice(skip, skip + limit);
}
