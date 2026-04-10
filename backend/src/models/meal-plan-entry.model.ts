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

// Index for fast slot lookups — not unique (up to 3 entries per slot allowed)
// NOTE: if upgrading from a schema that had { unique: true } on this index,
// drop the old index in the DB before restarting: db.mealplanentries.dropIndex("mealPlanId_1_dayOfWeek_1_mealType_1")
mealPlanEntrySchema.index({ mealPlanId: 1, dayOfWeek: 1, mealType: 1 });

export const MealPlanEntry = mongoose.model<IMealPlanEntry>(
  "MealPlanEntry",
  mealPlanEntrySchema
);
