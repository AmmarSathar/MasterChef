import { Request, Response, NextFunction } from "express";
import { loginUser, registerUser, toUserResponse, updateUserProfile } from "../services/auth.service.js";
import { CreateUserInput, LoginUserInput, UpdateProfileInput } from "../types/index.js";
import { createSessionForUser, revokeSession, resolveSessionUser } from "../lib/session.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name, rememberMe } = req.body as CreateUserInput & {
      rememberMe?: boolean;
    };

    console.log("request for data: ", email, name)

    const user = await registerUser({ email, password, name });
    await createSessionForUser(res, user.id, Boolean(rememberMe));

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
    const { email, password, rememberMe } = req.body as LoginUserInput;

    const user = await loginUser({ email, password });
    await createSessionForUser(res, user.id, Boolean(rememberMe));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await resolveSessionUser(req);

    if (!user) {
      res.status(200).json({
        success: true,
        user: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: toUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await revokeSession(req, res);
    res.status(200).json({ success: true });
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
