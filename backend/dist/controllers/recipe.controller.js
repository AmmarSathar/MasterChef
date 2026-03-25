"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.getById = getById;
exports.list = list;
exports.search = search;
exports.update = update;
exports.remove = remove;
exports.recommend = recommend;
const recipe_service_js_1 = require("../services/recipe.service.js");
async function create(req, res, next) {
    try {
        const { userId, ...recipeData } = req.body;
        const recipe = await (0, recipe_service_js_1.createRecipe)({ ...recipeData, userId });
        res.status(201).json({ success: true, data: recipe });
    }
    catch (error) {
        next(error);
    }
}
async function getById(req, res, next) {
    try {
        const id = req.params.id;
        const recipe = await (0, recipe_service_js_1.getRecipeById)(id);
        res.status(200).json({ success: true, data: recipe });
    }
    catch (error) {
        next(error);
    }
}
async function list(req, res, next) {
    try {
        const { page, limit, skillLevel, difficulty, cuisine, excludeTags, excludeAllergens, createdBy, search, max_time, dietary_tags, } = req.query;
        const result = await (0, recipe_service_js_1.getRecipes)({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            skillLevel: skillLevel,
            difficulty: difficulty,
            cuisine: cuisine,
            excludeTags: excludeTags ? excludeTags.split(",") : undefined,
            excludeAllergens: excludeAllergens ? excludeAllergens.split(",") : undefined,
            createdBy: createdBy,
            search: search,
            max_time: max_time ? Number(max_time) : undefined,
            dietary_tags: dietary_tags ? dietary_tags.split(",") : undefined,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function search(req, res, next) {
    try {
        const { q, page, limit } = req.query;
        const result = await (0, recipe_service_js_1.searchRecipes)({
            q: q,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        const id = req.params.id;
        const { userId, ...updateData } = req.body;
        const recipe = await (0, recipe_service_js_1.updateRecipe)({
            recipeId: id,
            userId,
            ...updateData,
        });
        res.status(200).json({ success: true, data: recipe });
    }
    catch (error) {
        next(error);
    }
}
async function remove(req, res, next) {
    try {
        const id = req.params.id;
        const { userId } = req.body;
        await (0, recipe_service_js_1.deleteRecipe)(id, userId);
        res.status(200).json({ success: true, message: "Recipe deleted" });
    }
    catch (error) {
        next(error);
    }
}
async function recommend(req, res, next) {
    try {
        const { availableIngredients, userId, limit, page } = req.body;
        const results = await (0, recipe_service_js_1.getRecommendations)({
            availableIngredients,
            userId,
            limit,
            page,
        });
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=recipe.controller.js.map