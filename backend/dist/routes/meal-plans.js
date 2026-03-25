"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const meal_plan_controller_js_1 = require("../controllers/meal-plan.controller.js");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_js_1.requireSession, meal_plan_controller_js_1.createMealPlan);
router.get("/", auth_middleware_js_1.requireSession, meal_plan_controller_js_1.getMealPlanByWeek);
router.get("/:id", auth_middleware_js_1.requireSession, meal_plan_controller_js_1.getMealPlanById);
router.post("/:id/entries", auth_middleware_js_1.requireSession, meal_plan_controller_js_1.createMealPlanEntry);
router.put("/entries/:id", auth_middleware_js_1.requireSession, meal_plan_controller_js_1.updateMealPlanEntry);
exports.default = router;
//# sourceMappingURL=meal-plans.js.map