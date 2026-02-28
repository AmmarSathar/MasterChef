import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { updateUserProfile } from "../services/auth.service.js";
import { UpdateProfileInput } from "../types/index.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getAuth } from "../lib/auth.js";

export async function setPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { newPassword } = req.body as { newPassword?: string };

    if (!newPassword || typeof newPassword !== "string") {
      res.status(400).json({ error: "newPassword is required" });
      return;
    }

    await getAuth().api.setPassword({
      headers: fromNodeHeaders(req.headers),
      body: { newPassword },
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    // BetterAuth throws APIError with message "user already has a password"
    if (error && typeof error === "object" && "message" in error) {
      const msg = (error as { message: string }).message;
      if (msg === "user already has a password") {
        res.status(409).json({ error: "PASSWORD_ALREADY_SET" });
        return;
      }
    }
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { session } = req as AuthenticatedRequest;
    const profileData = req.body as Omit<UpdateProfileInput, "userId">;

    console.log("updateProfile request - userId:", session.user.id, "fields:", Object.keys(profileData));

    const user = await updateUserProfile({ userId: session.user.id, ...profileData });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
