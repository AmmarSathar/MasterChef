import { Response, NextFunction } from "express";
import { getUserProfile, updateUserProfile } from "../services/user.service.js";
import { AuthenticatedRequest, UpdateProfileInput } from "../types/index.js";

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await getUserProfile(req.user.userId);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: UpdateProfileInput = req.body;
    const user = await updateUserProfile(req.user.userId, input);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
