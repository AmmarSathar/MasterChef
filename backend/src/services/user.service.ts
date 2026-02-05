import { User } from "../models/user.model.js";
import {
  UpdateProfileInput,
  UserResponse,
  ApiError,
  VALID_DIETARY_RESTRICTIONS,
  DietaryRestriction,
} from "../types/index.js";

export async function getUserProfile(userId: string): Promise<UserResponse> {
  const user = await User.findById(userId);
  if (!user) {
    const error: ApiError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    dietaryPreferences: user.dietaryPreferences,
  };
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserResponse> {
  const user = await User.findById(userId);
  if (!user) {
    const error: ApiError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate and update name
  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (trimmedName.length === 0) {
      const error: ApiError = new Error("Name cannot be empty");
      error.statusCode = 400;
      throw error;
    }
    if (trimmedName.length > 100) {
      const error: ApiError = new Error("Name cannot exceed 100 characters");
      error.statusCode = 400;
      throw error;
    }
    user.name = trimmedName;
  }

  // Validate and update dietary preferences
  if (input.dietaryPreferences) {
    const { restrictions, allergies } = input.dietaryPreferences;

    if (restrictions !== undefined) {
      // Validate restrictions
      for (const restriction of restrictions) {
        if (!VALID_DIETARY_RESTRICTIONS.includes(restriction as DietaryRestriction)) {
          const error: ApiError = new Error(
            `Invalid dietary restriction: ${restriction}. Valid values are: ${VALID_DIETARY_RESTRICTIONS.join(", ")}`
          );
          error.statusCode = 400;
          throw error;
        }
      }
      user.dietaryPreferences.restrictions = restrictions as DietaryRestriction[];
    }

    if (allergies !== undefined) {
      // Validate and process allergies
      const processedAllergies: string[] = [];
      const seen = new Set<string>();

      for (const allergy of allergies) {
        if (typeof allergy !== "string") {
          const error: ApiError = new Error("Allergies must be strings");
          error.statusCode = 400;
          throw error;
        }
        if (allergy.length > 50) {
          const error: ApiError = new Error("Each allergy cannot exceed 50 characters");
          error.statusCode = 400;
          throw error;
        }
        const normalized = allergy.toLowerCase().trim();
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          processedAllergies.push(normalized);
        }
      }
      user.dietaryPreferences.allergies = processedAllergies;
    }
  }

  await user.save();

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    dietaryPreferences: user.dietaryPreferences,
  };
}
