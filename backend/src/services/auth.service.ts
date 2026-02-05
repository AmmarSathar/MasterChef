import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/index.js";
import { CreateUserInput, UserResponse, ApiError, LoginInput, AuthResponse, JwtPayload } from "../types/index.js";
import { User } from "../models/user.model.js";

const SALT_ROUNDS = 10;

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function registerUser(input: CreateUserInput): Promise<AuthResponse> {
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

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      dietaryPreferences: user.dietaryPreferences,
    },
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  if (!email || !password) {
    const error: ApiError = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error: ApiError = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error: ApiError = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      dietaryPreferences: user.dietaryPreferences,
    },
    token,
  };
}
