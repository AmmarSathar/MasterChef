"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMealPlan = createMealPlan;
exports.getMealPlanByWeek = getMealPlanByWeek;
exports.getMealPlanById = getMealPlanById;
exports.createMealPlanEntry = createMealPlanEntry;
exports.updateMealPlanEntry = updateMealPlanEntry;
exports.assertMealPlanAccess = assertMealPlanAccess;
const mongoose_1 = __importDefault(require("mongoose"));
const meal_plan_model_js_1 = require("../models/meal-plan.model.js");
const meal_plan_entry_model_js_1 = require("../models/meal-plan-entry.model.js");
const recipe_model_js_1 = require("../models/recipe.model.js");
const constants_1 = require("@masterchef/shared/constants");
async function createMealPlan(input) {
    const { userId, weekStartDate: weekStartDateStr } = input;
    const weekStartDate = new Date(weekStartDateStr);
    if (isNaN(weekStartDate.getTime())) {
        const error = new Error("Invalid week_start_date");
        error.statusCode = 400;
        throw error;
    }
    if (weekStartDate.getUTCDay() !== 1) {
        const error = new Error("week_start_date must be a Monday");
        error.statusCode = 400;
        throw error;
    }
    // Normalize to midnight UTC
    weekStartDate.setUTCHours(0, 0, 0, 0);
    const existing = await meal_plan_model_js_1.MealPlan.findOne({
        userId: new mongoose_1.default.Types.ObjectId(userId),
        weekStartDate,
    });
    if (existing) {
        const error = new Error("A meal plan for this week already exists");
        error.statusCode = 409;
        throw error;
    }
    const mealPlan = await meal_plan_model_js_1.MealPlan.create({
        userId: new mongoose_1.default.Types.ObjectId(userId),
        weekStartDate,
    });
    return getMealPlanById(mealPlan._id.toString());
}
async function getMealPlanByWeek(userId, weekStartDateStr) {
    const weekStartDate = new Date(weekStartDateStr);
    if (isNaN(weekStartDate.getTime())) {
        const error = new Error("Invalid week_start_date");
        error.statusCode = 400;
        throw error;
    }
    if (weekStartDate.getUTCDay() !== 1) {
        const error = new Error("week_start_date must be a Monday");
        error.statusCode = 400;
        throw error;
    }
    weekStartDate.setUTCHours(0, 0, 0, 0);
    const mealPlan = await meal_plan_model_js_1.MealPlan.findOne({
        userId: new mongoose_1.default.Types.ObjectId(userId),
        weekStartDate,
    });
    if (!mealPlan) {
        const error = new Error("Meal plan not found");
        error.statusCode = 404;
        throw error;
    }
    return getMealPlanById(mealPlan._id.toString());
}
async function getMealPlanById(id) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid meal plan ID");
        error.statusCode = 400;
        throw error;
    }
    const mealPlan = await meal_plan_model_js_1.MealPlan.findById(id);
    if (!mealPlan) {
        const error = new Error("Meal plan not found");
        error.statusCode = 404;
        throw error;
    }
    const entries = await meal_plan_entry_model_js_1.MealPlanEntry.find({ mealPlanId: id }).populate("recipeId", "title");
    const days = {};
    for (const day of constants_1.dayOfWeekValues) {
        days[day] = {};
        for (const meal of constants_1.mealTypeValues) {
            const entry = entries.find((e) => e.dayOfWeek === day && e.mealType === meal);
            if (entry && entry.recipeId) {
                days[day][meal] = {
                    entryId: entry._id.toString(),
                    recipeId: entry.recipeId._id.toString(),
                    title: entry.recipeId.title,
                    notes: entry.notes ?? "",
                };
            }
            else {
                days[day][meal] = null;
            }
        }
    }
    return {
        id: mealPlan._id.toString(),
        weekStartDate: mealPlan.weekStartDate,
        days,
    };
}
async function createMealPlanEntry(input) {
    const { mealPlanId, userId, dayOfWeek, mealType, recipeId, notes } = input;
    if (!mongoose_1.default.Types.ObjectId.isValid(mealPlanId)) {
        const error = new Error("Invalid meal plan ID");
        error.statusCode = 400;
        throw error;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(recipeId)) {
        const error = new Error("Invalid recipe ID");
        error.statusCode = 400;
        throw error;
    }
    const mealPlan = await meal_plan_model_js_1.MealPlan.findById(mealPlanId);
    if (!mealPlan) {
        const error = new Error("Meal plan not found");
        error.statusCode = 404;
        throw error;
    }
    if (mealPlan.userId.toString() !== userId) {
        const error = new Error("You do not own this meal plan");
        error.statusCode = 403;
        throw error;
    }
    const recipe = await recipe_model_js_1.Recipe.findById(recipeId);
    if (!recipe) {
        const error = new Error("Recipe not found");
        error.statusCode = 404;
        throw error;
    }
    if (recipe.createdBy.toString() !== userId && !recipe.isPublic) {
        const error = new Error("You do not have access to this recipe");
        error.statusCode = 403;
        throw error;
    }
    try {
        const entry = await meal_plan_entry_model_js_1.MealPlanEntry.create({
            mealPlanId,
            dayOfWeek,
            mealType,
            recipeId,
            notes,
        });
        return {
            id: entry._id.toString(),
            mealPlanId: entry.mealPlanId.toString(),
            dayOfWeek: entry.dayOfWeek,
            mealType: entry.mealType,
            recipeId: entry.recipeId.toString(),
            notes: entry.notes,
            createdAt: entry.createdAt.toISOString(),
        };
    }
    catch (err) {
        if (typeof err === "object" &&
            err !== null &&
            "code" in err &&
            err.code === 11000) {
            const error = new Error("A recipe is already assigned to this slot");
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}
async function updateMealPlanEntry(input) {
    const { entryId, userId, recipeId, notes } = input;
    if (!mongoose_1.default.Types.ObjectId.isValid(entryId)) {
        const error = new Error("Invalid entry ID");
        error.statusCode = 400;
        throw error;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(recipeId)) {
        const error = new Error("Invalid recipe ID");
        error.statusCode = 400;
        throw error;
    }
    const entry = await meal_plan_entry_model_js_1.MealPlanEntry.findById(entryId);
    if (!entry) {
        const error = new Error("Meal plan entry not found");
        error.statusCode = 404;
        throw error;
    }
    await assertMealPlanAccess(entry.mealPlanId.toString(), userId);
    const recipe = await recipe_model_js_1.Recipe.findById(recipeId);
    if (!recipe) {
        const error = new Error("Recipe not found");
        error.statusCode = 404;
        throw error;
    }
    if (recipe.createdBy.toString() !== userId && !recipe.isPublic) {
        const error = new Error("You do not have access to this recipe");
        error.statusCode = 403;
        throw error;
    }
    entry.recipeId = new mongoose_1.default.Types.ObjectId(recipeId);
    entry.notes = notes;
    await entry.save();
    return {
        id: entry._id.toString(),
        mealPlanId: entry.mealPlanId.toString(),
        dayOfWeek: entry.dayOfWeek,
        mealType: entry.mealType,
        recipeId: entry.recipeId.toString(),
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
    };
}
async function assertMealPlanAccess(mealPlanId, userId) {
    try {
        const mealPlan = await meal_plan_model_js_1.MealPlan.findById(mealPlanId);
        // 404: meal plan does not exist
        if (!mealPlan) {
            throw Object.assign(new Error("Meal plan not found"), {
                statusCode: 404,
            });
        }
        // 403: user is not the owner
        if (mealPlan.userId.toString() !== userId) {
            throw Object.assign(new Error("Forbidden"), {
                statusCode: 403,
            });
        }
        return mealPlan;
    }
    catch (error) {
        // If already one of our custom errors, rethrow it
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error;
        }
        // Otherwise, treat as an unexpected server error
        throw Object.assign(new Error("Internal server error"), {
            statusCode: 500,
        });
    }
}
//# sourceMappingURL=meal-plan.service.js.map