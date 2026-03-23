import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";
import { MealPlanEntry } from "../src/models/meal-plan-entry.model.js";
import { createMealPlanEntry } from "../src/services/meal-plan.service.js";
import { assertMealPlanAccess } from "../src/services/meal-plan.service.js";

describe("MealPlanEntry service", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await MealPlan.init();
    await MealPlanEntry.init();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await MealPlan.deleteMany({});
    await MealPlanEntry.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await MealPlanEntry.deleteMany({});
    await MealPlan.deleteMany({});
    await User.deleteMany({});
  });

  it("fails validation when userId is missing", () => {
    const doc = new MealPlan({ weekStartDate: new Date() });
    const error = doc.validateSync();

    expect(error).toBeTruthy();
    expect(error?.errors.userId?.message).toBe("User ID is required");
  });

  it("fails validation when weekStartDate is missing", () => {
    const doc = new MealPlan({ userId: new mongoose.Types.ObjectId() });
    const error = doc.validateSync();

    expect(error).toBeTruthy();
    expect(error?.errors.weekStartDate?.message).toBe(
      "Week start date is required"
    );
  });

    it("successfully assigns a recipe to a meal plan slot", async () => {
    const user = await User.create({
      email: "assign@example.com",
      name: "Assign User",
      passwordHash: "hashed-password",
    });

    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    const recipe = await Recipe.create({
      title: "Avocado Toast",
      createdBy: user._id,
      isPublic: false,
    });

    const result = await createMealPlanEntry({
      mealPlanId: mealPlan._id.toString(),
      userId: user._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe._id.toString(),
      notes: "Quick breakfast",
    });

    expect(result).toMatchObject({
      mealPlanId: mealPlan._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe._id.toString(),
      notes: "Quick breakfast",
    });

    const entryInDb = await MealPlanEntry.findById(result.id);
    expect(entryInDb).not.toBeNull();
    expect(entryInDb?.mealPlanId.toString()).toBe(mealPlan._id.toString());
    expect(entryInDb?.recipeId.toString()).toBe(recipe._id.toString());
  });


});