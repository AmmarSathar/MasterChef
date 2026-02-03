import bcrypt from "bcrypt";
import { CreateUserInput, User, UserResponse, ApiError } from "../types/index.js";

const SALT_ROUNDS = 10;

// TODO: Replace with actual database implementation
const users: Map<string, User> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function registerUser(input: CreateUserInput): Promise<UserResponse> {
  const { email, password, name } = input;

  // Validation
  if (!email || !password || !name) {
    const error: ApiError = new Error("Email, password, and name are required");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error: ApiError = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error: ApiError = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }

  // Check for duplicate email
  // TODO: Replace with database query
  for (const user of users.values()) {
    if (user.email === email) {
      const error: ApiError = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user: User = {
    id: generateId(),
    email,
    name,
    passwordHash,
    createdAt: new Date(),
  };

  // TODO: Save to database
  users.set(user.id, user);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
