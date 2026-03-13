import mongoose, { Schema, Document } from "mongoose";
import { dayOfWeekValues, mealTypeValues } from "@masterchef/shared/constants";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";

export interface IMealPlanEntry extends Document {
  mealPlanId: mongoose.Types.ObjectId;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mealPlanEntrySchema = new Schema<IMealPlanEntry>(
  {
    mealPlanId: {
      type: Schema.Types.ObjectId,
      ref: "MealPlan",
      required: [true, "Meal plan ID is required"],
      index: true,
    },
    dayOfWeek: {
      type: String,
      required: [true, "Day of week is required"],
      enum: {
        values: dayOfWeekValues,
        message: "Day of week must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      },
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      enum: {
        values: mealTypeValues,
        message: "Meal type must be one of: breakfast, lunch, dinner, snack",
      },
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: [true, "Recipe ID is required"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Duplicate prevention: one slot per (mealPlanId, dayOfWeek, mealType)
mealPlanEntrySchema.index(
  { mealPlanId: 1, dayOfWeek: 1, mealType: 1 },
  { unique: true }
);

export const MealPlanEntry = mongoose.model<IMealPlanEntry>(
  "MealPlanEntry",
  mealPlanEntrySchema
);
