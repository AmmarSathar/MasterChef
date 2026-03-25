"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipe = createRecipe;
exports.getRecipeById = getRecipeById;
exports.getRecipes = getRecipes;
exports.searchRecipes = searchRecipes;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
exports.getRecommendations = getRecommendations;
const constants_1 = require("@masterchef/shared/constants");
const recipe_model_js_1 = require("../models/recipe.model.js");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
// ── Helpers: compute tags from ingredients ─────────────────────
function computeDietaryTags(ingredientNames) {
    const tagSet = new Set();
    for (const name of ingredientNames) {
        const food = constants_1.foods.find((f) => f.name === name);
        if (food) {
            food.tags.forEach((tag) => tagSet.add(tag));
        }
    }
    return Array.from(tagSet);
}
function computeAllergens(ingredientNames) {
    const allergenSet = new Set();
    for (const name of ingredientNames) {
        const food = constants_1.foods.find((f) => f.name === name);
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
function toRecipeResponse(recipe) {
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
        createdBy: recipe.createdBy.toString(),
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
    };
}
// ── CRUD ───────────────────────────────────────────────────────
async function createRecipe(input) {
    const { title, description, ingredients, steps, cookingTime, servings, skillLevel, cuisine, imageUrl, userId, } = input;
    if (!title || !description || !ingredients?.length || !steps?.length
        || !cookingTime || !servings || !skillLevel) {
        const error = new Error("Title, description, ingredients, steps, cookingTime, servings, and skillLevel are required");
        error.statusCode = 400;
        throw error;
    }
    for (const ing of ingredients) {
        if (!ing.foodItem || ing.amount == null || !ing.unit) {
            const error = new Error("Each ingredient must have foodItem, amount, and unit");
            error.statusCode = 400;
            throw error;
        }
    }
    const ingredientNames = ingredients.map((i) => i.foodItem);
    const dietaryTags = computeDietaryTags(ingredientNames);
    const containsAllergens = computeAllergens(ingredientNames);
    const recipe = await recipe_model_js_1.Recipe.create({
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
        createdBy: userId,
    });
    return toRecipeResponse(recipe);
}
async function getRecipeById(recipeId) {
    const recipe = await recipe_model_js_1.Recipe.findById(recipeId);
    if (!recipe) {
        const error = new Error("Recipe not found");
        error.statusCode = 404;
        throw error;
    }
    return toRecipeResponse(recipe);
}
async function getRecipes(query) {
    const { page = 1, limit = 20, skillLevel, difficulty, cuisine, excludeTags, excludeAllergens, createdBy, search, max_time, dietary_tags, } = query;
    const filter = {};
    // difficulty is an alias for skillLevel; difficulty takes precedence
    const resolvedSkillLevel = difficulty ?? skillLevel;
    if (resolvedSkillLevel)
        filter.skillLevel = resolvedSkillLevel;
    if (cuisine)
        filter.cuisine = cuisine;
    if (createdBy)
        filter.createdBy = createdBy;
    if (max_time)
        filter.cookingTime = { $lte: max_time };
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
        recipe_model_js_1.Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        recipe_model_js_1.Recipe.countDocuments(filter),
    ]);
    return {
        recipes: recipes.map(toRecipeResponse),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
async function searchRecipes(input) {
    const { q, page = 1, limit = 20 } = input;
    if (!q?.trim()) {
        const error = new Error("Search query q is required");
        error.statusCode = 400;
        throw error;
    }
    const regex = new RegExp(q.trim(), "i");
    const filter = {
        $or: [
            { title: regex },
            { description: regex },
            { "ingredients.foodItem": regex },
        ],
    };
    const skip = (page - 1) * limit;
    const [recipes, total] = await Promise.all([
        recipe_model_js_1.Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        recipe_model_js_1.Recipe.countDocuments(filter),
    ]);
    return {
        recipes: recipes.map(toRecipeResponse),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
async function updateRecipe(input) {
    const { recipeId, userId, ...updateData } = input;
    if (!recipeId) {
        const error = new Error("Recipe ID is required");
        error.statusCode = 400;
        throw error;
    }
    const recipe = await recipe_model_js_1.Recipe.findById(recipeId);
    if (!recipe) {
        const error = new Error("Recipe not found");
        error.statusCode = 404;
        throw error;
    }
    if (recipe.createdBy.toString() !== userId) {
        const error = new Error("You can only edit your own recipes");
        error.statusCode = 403;
        throw error;
    }
    // Recompute tags if ingredients changed
    if (updateData.ingredients?.length) {
        const ingredientNames = updateData.ingredients.map((i) => i.foodItem);
        updateData.dietaryTags = computeDietaryTags(ingredientNames);
        updateData.containsAllergens = computeAllergens(ingredientNames);
    }
    const updated = await recipe_model_js_1.Recipe.findByIdAndUpdate(recipeId, { $set: updateData }, { new: true, runValidators: true });
    if (!updated) {
        const error = new Error("Recipe not found after update");
        error.statusCode = 404;
        throw error;
    }
    return toRecipeResponse(updated);
}
async function deleteRecipe(recipeId, userId) {
    const recipe = await recipe_model_js_1.Recipe.findById(recipeId);
    if (!recipe) {
        const error = new Error("Recipe not found");
        error.statusCode = 404;
        throw error;
    }
    if (recipe.createdBy.toString() !== userId) {
        const error = new Error("You can only delete your own recipes");
        error.statusCode = 403;
        throw error;
    }
    await recipe_model_js_1.Recipe.findByIdAndDelete(recipeId);
}
// ── Recommendation Engine ──────────────────────────────────────
async function getRecommendations(input) {
    const { availableIngredients, userId, limit = 20, page = 1 } = input;
    if (!availableIngredients?.length) {
        const error = new Error("At least one available ingredient is required");
        error.statusCode = 400;
        throw error;
    }
    // Fetch user preferences if userId provided
    let userDiets = [];
    let userAllergies = [];
    let userCuisines = [];
    if (userId) {
        const db = mongoose_1.default.connection.db;
        if (db) {
            const user = await db.collection("user").findOne({ _id: new ObjectId(userId) });
            if (user) {
                userDiets = user.dietary_restric ?? [];
                userAllergies = user.allergies ?? [];
                userCuisines = user.cuisines_pref ?? [];
            }
        }
    }
    // Convert dietary restrictions to excluded tags
    const excludedTags = userDiets.flatMap((diet) => [...(constants_1.dietaryExclusions[diet] ?? [])]);
    // MongoDB filter: exclude conflicting recipes
    const filter = {};
    if (excludedTags.length) {
        filter.dietaryTags = { $nin: excludedTags };
    }
    if (userAllergies.length) {
        filter.containsAllergens = { $nin: userAllergies };
    }
    const candidates = await recipe_model_js_1.Recipe.find(filter);
    // Score each candidate by ingredient match
    const availableSet = new Set(availableIngredients.map((n) => n.toLowerCase()));
    const scored = candidates.map((recipe) => {
        const recipeIngredientNames = recipe.ingredients.map((i) => i.foodItem.toLowerCase());
        const totalIngredients = recipeIngredientNames.length;
        const matchedCount = recipeIngredientNames.filter((name) => availableSet.has(name)).length;
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
        if (b.matchScore !== a.matchScore)
            return b.matchScore - a.matchScore;
        return a.missingIngredients.length - b.missingIngredients.length;
    });
    const skip = (page - 1) * limit;
    return scored.slice(skip, skip + limit);
}
//# sourceMappingURL=recipe.service.js.map