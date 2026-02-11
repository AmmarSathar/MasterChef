import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// User types
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  userId: string;
  pfp?: string;
  age?: number;
  birth?: string;
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
  cuisines_pref?: string[];
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  pfp?: string;
  age?: number;
  birth?: string;
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: string;
  cuisines_pref?: string[];
}
