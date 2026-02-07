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
  dietaryPreferences?: string[];    // optional property
  allergies?: string[];             // optional property
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  dietaryPreferences?: string[];    // optional property
  allergies?: string[];             // optional property
}
