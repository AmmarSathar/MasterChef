import mongoose, { Schema, Document } from "mongoose";

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mealPlanSchema = new Schema<IMealPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, "Week start date is required"],
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

export const MealPlan = mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
