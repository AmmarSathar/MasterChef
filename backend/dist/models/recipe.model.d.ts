import mongoose, { Document } from "mongoose";
export interface IIngredient {
    foodItem: string;
    amount: number;
    unit: string;
    notes?: string;
}
export interface IRecipe extends Document {
    title: string;
    description: string;
    ingredients: IIngredient[];
    steps: string[];
    cookingTime: number;
    servings: number;
    skillLevel: string;
    cuisine?: string;
    imageUrl?: string;
    dietaryTags: string[];
    containsAllergens: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Recipe: mongoose.Model<IRecipe, {}, {}, {}, mongoose.Document<unknown, {}, IRecipe, {}, mongoose.DefaultSchemaOptions> & IRecipe & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRecipe>;
//# sourceMappingURL=recipe.model.d.ts.map