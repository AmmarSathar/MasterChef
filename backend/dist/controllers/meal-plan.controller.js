"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMealPlan = createMealPlan;
exports.getMealPlanById = getMealPlanById;
exports.getMealPlanByWeek = getMealPlanByWeek;
exports.createMealPlanEntry = createMealPlanEntry;
exports.updateMealPlanEntry = updateMealPlanEntry;
const meal_plan_service_js_1 = require("../services/meal-plan.service.js");
async function createMealPlan(req, res, next) {
    try {
        const { week_start_date } = req.body;
        const userId = req.session.user.id;
        if (!week_start_date) {
            res.status(400).json({ success: false, error: "week_start_date is required" });
            return;
        }
        const result = await (0, meal_plan_service_js_1.createMealPlan)({ userId, weekStartDate: week_start_date });
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getMealPlanById(req, res, next) {
    try {
        const id = req.params.id;
        const result = await (0, meal_plan_service_js_1.getMealPlanById)(id);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getMealPlanByWeek(req, res, next) {
    try {
        const userId = req.session.user.id;
        const weekStartDate = req.query.week_start_date;
        if (!weekStartDate) {
            res.status(400).json({ success: false, error: "week_start_date is required" });
            return;
        }
        const result = await (0, meal_plan_service_js_1.getMealPlanByWeek)(userId, weekStartDate);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function createMealPlanEntry(req, res, next) {
    try {
        const mealPlanId = req.params.id;
        const userId = req.session.user.id;
        const { day_of_week, meal_type, recipe_id, notes } = req.body;
        const result = await (0, meal_plan_service_js_1.createMealPlanEntry)({
            mealPlanId,
            userId,
            dayOfWeek: day_of_week,
            mealType: meal_type,
            recipeId: recipe_id,
            notes,
        });
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function updateMealPlanEntry(req, res, next) {
    try {
        const userId = req.session.user.id;
        const id = req.params.id;
        const { recipe_id, notes } = req.body;
        if (!recipe_id) {
            const error = new Error("recipe_id is required");
            error.statusCode = 400;
            throw error;
        }
        const result = await (0, meal_plan_service_js_1.updateMealPlanEntry)({ entryId: id, userId, recipeId: recipe_id, notes });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=meal-plan.controller.js.map