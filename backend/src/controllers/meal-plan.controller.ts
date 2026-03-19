import { Request, Response, NextFunction } from "express";
import { getMealPlanById as getMealPlanByIdService } from "../services/meal-plan.service.js";

export async function getMealPlanById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await getMealPlanByIdService(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}