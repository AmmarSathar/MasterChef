export interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: Ingredient[];
    steps: string[];
    cookingTime: number;
    servings: number;
    difficulty: RecipeDifficulty;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
}
export declare enum RecipeDifficulty {
    Easy = "easy",
    Medium = "medium",
    Hard = "hard"
}
//# sourceMappingURL=recipe.d.ts.map