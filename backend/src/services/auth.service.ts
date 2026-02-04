import bcrypt from "bcrypt";
import { CreateUserInput, UserResponse, ApiError } from "../types/index.js";
import { User } from "../models/user.model.js";

const SALT_ROUNDS = 10;

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
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error: ApiError = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in database
  const user = await User.create({
    email,
    name,
    passwordHash,
  });

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}
