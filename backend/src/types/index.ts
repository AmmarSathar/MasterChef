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

// Dietary types
export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "halal"
  | "kosher";

export const VALID_DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "halal",
  "kosher",
];

export interface DietaryPreferences {
  restrictions: DietaryRestriction[];
  allergies: string[];
}

export interface UpdateProfileInput {
  name?: string;
  dietaryPreferences?: Partial<DietaryPreferences>;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  dietaryPreferences?: DietaryPreferences;
}

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
