import mongoose, { Schema, Document } from "mongoose";
import { DietaryRestriction, DietaryPreferences, VALID_DIETARY_RESTRICTIONS } from "../types/index.js";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  dietaryPreferences: DietaryPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    dietaryPreferences: {
      restrictions: {
        type: [String],
        enum: VALID_DIETARY_RESTRICTIONS,
        default: [],
      },
      allergies: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent password hash from being returned in queries by default
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { passwordHash, __v, ...rest } = ret;
    return rest;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
