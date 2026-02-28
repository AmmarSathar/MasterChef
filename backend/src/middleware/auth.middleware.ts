import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "../lib/auth.js";

export interface AuthenticatedRequest extends Request {
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      [key: string]: unknown;
    };
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      [key: string]: unknown;
    };
  };
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await getAuth().api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).session = session;
  next();
}
