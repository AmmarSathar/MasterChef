import mongoose from "mongoose";
import { UpdateProfileInput, ApiError } from "../types/index.js";

const { ObjectId } = mongoose.Types;

export async function updateUserProfile(input: UpdateProfileInput): Promise<Record<string, unknown>> {
  const { userId, ...profileData } = input;

  if (!userId) {
    const error: ApiError = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  const db = mongoose.connection.db;
  if (!db) {
    const error: ApiError = new Error("Database not connected");
    error.statusCode = 500;
    throw error;
  }

  // BetterAuth generates IDs via new ObjectId().toString(), then stores them as
  // actual ObjectId values in MongoDB. We must convert back to ObjectId to query.
  const result = await db.collection("user").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { ...profileData, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    const error: ApiError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { _id, ...user } = result as Record<string, unknown>;
  void _id;

  return user;
}
