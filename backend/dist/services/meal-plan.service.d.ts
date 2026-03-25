import mongoose from "mongoose";
import type { CreateMealPlanInput, MealPlanResponse, CreateMealPlanEntryInput, MealPlanEntryResponse, UpdateMealPlanEntryInput } from "../types/index.js";
export declare function createMealPlan(input: CreateMealPlanInput): Promise<MealPlanResponse>;
export declare function getMealPlanByWeek(userId: string, weekStartDateStr: string): Promise<MealPlanResponse>;
export declare function getMealPlanById(id: string): Promise<MealPlanResponse>;
export declare function createMealPlanEntry(input: CreateMealPlanEntryInput): Promise<MealPlanEntryResponse>;
export declare function updateMealPlanEntry(input: UpdateMealPlanEntryInput): Promise<MealPlanEntryResponse>;
export declare function assertMealPlanAccess(mealPlanId: string, userId: string): Promise<mongoose.Document<unknown, {}, import("../models/meal-plan.model.js").IMealPlan, {}, mongoose.DefaultSchemaOptions> & import("../models/meal-plan.model.js").IMealPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=meal-plan.service.d.ts.map