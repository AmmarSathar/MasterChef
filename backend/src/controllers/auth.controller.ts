import { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/auth.service.js";
import { CreateUserInput } from "../types/index.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name } = req.body as CreateUserInput;

    const user = await registerUser({ email, password, name });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
