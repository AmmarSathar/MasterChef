import { Request, Response, NextFunction } from "express";
import {
  createRecipe,
  getRecipeById,
  getRecipes,
  searchRecipes,
  updateRecipe,
  deleteRecipe,
  getRecommendations,
} from "../services/recipe.service.js";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, ...recipeData } = req.body;
    const recipe = await createRecipe({ ...recipeData, userId });
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const recipe = await getRecipeById(id);
    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page, limit, skillLevel, difficulty, cuisine,
      excludeTags, excludeAllergens, createdBy, search,
      max_time, dietary_tags,
    } = req.query;

    const result = await getRecipes({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      skillLevel: skillLevel as string,
      difficulty: difficulty as string,
      cuisine: cuisine as string,
      excludeTags: excludeTags ? (excludeTags as string).split(",") : undefined,
      excludeAllergens: excludeAllergens ? (excludeAllergens as string).split(",") : undefined,
      createdBy: createdBy as string,
      search: search as string,
      max_time: max_time ? Number(max_time) : undefined,
      dietary_tags: dietary_tags ? (dietary_tags as string).split(",") : undefined,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function search(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, page, limit } = req.query;
    const result = await searchRecipes({
      q: q as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { userId, ...updateData } = req.body;
    const recipe = await updateRecipe({
      recipeId: id,
      userId,
      ...updateData,
    });
    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { userId } = req.body;
    await deleteRecipe(id, userId);
    res.status(200).json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    next(error);
  }
}

export async function recommend(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { availableIngredients, userId, limit, page } = req.body;
    const results = await getRecommendations({
      availableIngredients,
      userId,
      limit,
      page,
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}
