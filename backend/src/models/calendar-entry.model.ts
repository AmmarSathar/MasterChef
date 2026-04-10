import mongoose, { Schema, Document } from "mongoose";
import { mealTypeValues } from "@masterchef/shared/constants";

// Calendar uses breakfast | lunch | dinner only (no snack)
export const CALENDAR_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type CalendarMealType = (typeof CALENDAR_MEAL_TYPES)[number];

export interface ICalendarEntry extends Document {
  userId: mongoose.Types.ObjectId;
  /** UTC midnight of the specific calendar date */
  date: Date;
  mealType: CalendarMealType;
  recipeId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const calendarEntrySchema = new Schema<ICalendarEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      enum: {
        values: mealTypeValues.filter((m) => m !== "snack"),
        message: "Meal type must be one of: breakfast, lunch, dinner",
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

// One final assignment per slot per day per user
calendarEntrySchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

// Fast week-range lookups
calendarEntrySchema.index({ userId: 1, date: 1 });

export const CalendarEntry = mongoose.model<ICalendarEntry>(
  "CalendarEntry",
  calendarEntrySchema
);
