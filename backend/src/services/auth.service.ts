import bcrypt from "bcrypt";
import {
  CreateUserInput,
  LoginUserInput,
  UpdateProfileInput,
  UserResponse,
  ApiError,
} from "../types/index.js";
import { User } from "../models/user.model.js";

const SALT_ROUNDS = 10;

function toUserResponse(user: InstanceType<typeof User>): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    pfp: user.pfp,
    age: user.age,
    birth: user.birth,
    weight: user.weight,
    height: user.height,
    bio: user.bio,
    dietary_restric: user.dietary_restric,
    allergies: user.allergies,
    skill_level: user.skill_level,
    cuisines_pref: user.cuisines_pref,
    isCustomized: user.isCustomized,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
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

  return toUserResponse(user);
}

export async function loginUser(input: LoginUserInput): Promise<UserResponse> {
  const { email, password } = input;

  if (!email || !password) {
    const error: ApiError = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error: ApiError = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error: ApiError = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    const error: ApiError = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return toUserResponse(user);
}

export async function updateUserProfile(input: UpdateProfileInput): Promise<UserResponse> {
  const { userId, ...profileData } = input;

  if (!userId) {
    const error: ApiError = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: profileData },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error: ApiError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return toUserResponse(user);
}
