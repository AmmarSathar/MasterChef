import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";
import { MealPlanEntry } from "../src/models/meal-plan-entry.model.js";

describe("MealPlan model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Ensure indexes are built before duplicate-key tests
    await User.init();
    await MealPlan.init();
    await MealPlanEntry.init();
  });

  afterEach(async () => {
    // Clean up after each test
    await MealPlanEntry.deleteMany({});
    await MealPlan.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("fetches a meal plan entry by composite ID { mealPlanId, dayOfWeek, mealType }", async () => {
    
    // Create a user (user._id, user.email, user.name)
    const user = await User.create({
      email: "fetchmealplan@example.com",
      name: "Fetch Meal Plan User",
      passwordHash: "hashed-password",
    });
   
    // Create a meal plan for this user (mealPlan._id, mealPlan.userId, mealPlan.weekStartDate)
    const mealPlan = await MealPlan.create({
      userId: user._id, // Sets the user with this user._id as the owner of the meal plan
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"), // Starting date of the week for this meal plan (March 9, 2026)
    });

    // Mock recipe ID; MealPlanEntry requires a recipeId, but the actual recipe is not relevant to this test
    const recipeId = new mongoose.Types.ObjectId();

    // Create a meal plan entry (one meal slot in the weekly plan)
    await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId,
      notes: "Oatmeal with berries",
    });

    // Fetch the meal plan entry using the composite ID { mealPlanId, dayOfWeek, mealType }
    const foundEntry = await MealPlanEntry.findOne({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Monday",
      mealType: "breakfast",
    });

    expect(foundEntry).not.toBeNull(); // Check that the entry exists
    expect(foundEntry?.mealPlanId.toString()).toBe(mealPlan._id.toString()); // Check that the retrieved entry belongs to the correct meal plan
    expect(foundEntry?.dayOfWeek).toBe("Monday"); // Check that the meal plan entry was stored correctly
    expect(foundEntry?.mealType).toBe("breakfast");
    expect(foundEntry?.recipeId.toString()).toBe(recipeId.toString());
    expect(foundEntry?.notes).toBe("Oatmeal with berries");
  });

});