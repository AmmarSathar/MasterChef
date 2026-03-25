import mongoose, { Document } from "mongoose";
export interface IMealPlan extends Document {
    userId: mongoose.Types.ObjectId;
    weekStartDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MealPlan: mongoose.Model<IMealPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMealPlan, {}, mongoose.DefaultSchemaOptions> & IMealPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMealPlan>;
//# sourceMappingURL=meal-plan.model.d.ts.map