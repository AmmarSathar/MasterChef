import type { CreateRecipeInput, UpdateRecipeInput, RecipeResponse, RecipeQueryInput, RecommendationInput, RecommendationResult } from "../types/index.js";
export declare function createRecipe(input: CreateRecipeInput): Promise<RecipeResponse>;
export declare function getRecipeById(recipeId: string): Promise<RecipeResponse>;
export declare function getRecipes(query: RecipeQueryInput): Promise<{
    recipes: RecipeResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare function updateRecipe(input: UpdateRecipeInput): Promise<RecipeResponse>;
export declare function deleteRecipe(recipeId: string, userId: string): Promise<void>;
export declare function getRecommendations(input: RecommendationInput): Promise<RecommendationResult[]>;
//# sourceMappingURL=recipe.service.d.ts.map