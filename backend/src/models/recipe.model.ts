import mongoose, { Schema, Document } from "mongoose";
import { skillLevelValues, cuisineOptions } from "@masterchef/shared/constants";

export interface IIngredient {
  foodItem: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: IIngredient[];
  steps: string[];
  prepingTime: number;
  cookingTime: number;
  servings: number;
  skillLevel: string;
  cuisine?: string;
  imageUrl?: string;
  dietaryTags: string[];
  containsAllergens: string[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    foodItem: {
      type: String,
      required: [true, "Ingredient food item name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Ingredient amount is required"],
      min: [0, "Amount must be non-negative"],
    },
    unit: {
      type: String,
      required: [true, "Ingredient unit is required"],
      trim: true,
    },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: (v: IIngredient[]) => v.length > 0,
        message: "At least one ingredient is required",
      },
    },
    steps: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one step is required",
      },
    },
    prepingTime: {
      type: Number,
      required: [true, "Preparation time is required"],
      default: 1,
      min: [1, "Preparation time must be at least 1 minute"],
    },
    cookingTime: {
      type: Number,
      required: [true, "Cooking time is required"],
      min: [1, "Cooking time must be at least 1 minute"],
    },
    servings: {
      type: Number,
      required: [true, "Servings is required"],
      min: [1, "Servings must be at least 1"],
    },
    skillLevel: {
      type: String,
      required: [true, "Skill level is required"],
      enum: {
        values: skillLevelValues,
        message: "Skill level must be one of: {VALUE}",
      },
    },
    cuisine: {
      type: String,
      enum: {
        values: cuisineOptions,
        message: "Cuisine must be one of: {VALUE}",
      },
    },
    imageUrl: { type: String, trim: true },
    dietaryTags: { type: [String], default: [], index: true },
    containsAllergens: { type: [String], default: [], index: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required"],
      index: true,
    },
    isPublic: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ dietaryTags: 1, skillLevel: 1 });
recipeSchema.index({ title: "text", description: "text" });

export const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
