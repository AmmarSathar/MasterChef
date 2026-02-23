import bcrypt from "bcrypt";
import mongoose from "mongoose";
import {
  CreateUserInput,
  LoginUserInput,
  UpdateProfileInput,
  UserResponse,
  ApiError,
} from "../types/index.js";
import { User } from "../models/user.model.js";
import { Profile } from "../models/profile.model.js";
import { config } from "../config/index.js";

const SALT_ROUNDS = 10;

interface UserLike {
  _id: mongoose.Types.ObjectId | string;
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
  skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
  cuisines_pref?: string[];
  isCustomized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponse(user: UserLike): UserResponse {
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
  // Conservative validation for common email formats; rejects trailing quotes and malformed domains.
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

export async function registerUser(input: CreateUserInput): Promise<UserResponse> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const name = input.name?.trim();

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
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error: ApiError = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in database
  let user;
  try {
    user = await User.create({
      email,
      name,
      passwordHash,
    });
  } catch (error: unknown) {
    // Handle duplicate key race-condition safely as 409 instead of generic 500.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const conflictError: ApiError = new Error("Email already registered");
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }

  return toUserResponse(user);
}

export async function loginUser(input: LoginUserInput): Promise<UserResponse> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

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

  const user = await User.findOne({ email });
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

  const isMongoObjectId = mongoose.Types.ObjectId.isValid(userId);

  if (isMongoObjectId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true, runValidators: true }
    );

    if (user) {
      return toUserResponse(user as unknown as UserLike);
    }
  }

  const profile = await Profile.findOneAndUpdate(
    { authUserId: userId },
    { $set: profileData },
    { new: true, runValidators: true }
  );

  if (profile) {
    return {
      id: profile.authUserId,
      email: profile.email,
      name: profile.name,
      pfp: profile.pfp,
      age: profile.age,
      birth: profile.birth,
      weight: profile.weight,
      height: profile.height,
      bio: profile.bio,
      dietary_restric: profile.dietary_restric,
      allergies: profile.allergies,
      skill_level: profile.skill_level,
      cuisines_pref: profile.cuisines_pref,
      isCustomized: profile.isCustomized,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  // If this is a Better Auth user with no profile yet, create one on first customization submit.
  const betterAuthUser = await mongoose.connection
    .collection(config.betterAuthUserModelName)
    .findOne<{ id: string; email?: string; name?: string; image?: string }>({ id: userId });

  if (!betterAuthUser?.email) {
    const error: ApiError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const createdProfile = await Profile.create({
    authUserId: userId,
    email: betterAuthUser.email.toLowerCase(),
    name: betterAuthUser.name ?? "User",
    pfp: profileData.pfp ?? betterAuthUser.image,
    age: profileData.age,
    birth: profileData.birth,
    weight: profileData.weight,
    height: profileData.height,
    bio: profileData.bio,
    dietary_restric: profileData.dietary_restric ?? [],
    allergies: profileData.allergies ?? [],
    skill_level: profileData.skill_level,
    cuisines_pref: profileData.cuisines_pref ?? [],
    isCustomized: profileData.isCustomized ?? false,
  });

  return {
    id: createdProfile.authUserId,
    email: createdProfile.email,
    name: createdProfile.name,
    pfp: createdProfile.pfp,
    age: createdProfile.age,
    birth: createdProfile.birth,
    weight: createdProfile.weight,
    height: createdProfile.height,
    bio: createdProfile.bio,
    dietary_restric: createdProfile.dietary_restric,
    allergies: createdProfile.allergies,
    skill_level: createdProfile.skill_level,
    cuisines_pref: createdProfile.cuisines_pref,
    isCustomized: createdProfile.isCustomized,
    createdAt: createdProfile.createdAt,
    updatedAt: createdProfile.updatedAt,
  };
}
