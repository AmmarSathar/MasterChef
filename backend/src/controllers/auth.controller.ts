import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import { CreateUserInput, LoginInput } from "../types/index.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name } = req.body as CreateUserInput;

    const { user, token } = await registerUser({ email, password, name });

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;

    const { user, token } = await loginUser({ email, password });

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}
