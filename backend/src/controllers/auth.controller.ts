import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, updateUserProfile } from "../services/auth.service.js";
import { CreateUserInput, LoginUserInput, UpdateProfileInput } from "../types/index.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name } = req.body as CreateUserInput;

    console.log("request for data: ", email, name)

    const user = await registerUser({ email, password, name });

    res.status(201).json({
      success: true,
      user,
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
    const { email, password } = req.body as LoginUserInput;

    const user = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, ...profileData } = req.body as UpdateProfileInput;

    console.log("updateProfile request - userId:", userId, "fields:", Object.keys(profileData));

    const user = await updateUserProfile({ userId, ...profileData });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
