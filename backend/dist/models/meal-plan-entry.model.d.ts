import mongoose, { Document } from "mongoose";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";
export interface IMealPlanEntry extends Document {
    mealPlanId: mongoose.Types.ObjectId;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    recipeId: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MealPlanEntry: mongoose.Model<IMealPlanEntry, {}, {}, {}, mongoose.Document<unknown, {}, IMealPlanEntry, {}, mongoose.DefaultSchemaOptions> & IMealPlanEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMealPlanEntry>;
//# sourceMappingURL=meal-plan-entry.model.d.ts.map