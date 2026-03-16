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

    // Create an entry for this meal plan (one meal slot in the weekly plan)
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
    
    // Check that the meal plan entry was stored correctly
    expect(foundEntry?.dayOfWeek).toBe("Monday");
    expect(foundEntry?.mealType).toBe("breakfast");
    expect(foundEntry?.recipeId.toString()).toBe(recipeId.toString());
    expect(foundEntry?.notes).toBe("Oatmeal with berries");
  });

  it("prevents duplicate meal plan entries with the same composite ID { mealPlanId, dayOfWeek, mealType }", async () => {
    
    // Create a user
    const user = await User.create({
      email: "duplicateentry@example.com",
      name: "Duplicate Entry User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for this user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create an entry for this meal plan
    await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: new mongoose.Types.ObjectId(),
      notes: "First breakfast entry",
    });

    // Attempt to create a duplicate entry with the same composite ID
    await expect(
      MealPlanEntry.create({
        mealPlanId: mealPlan._id,
        dayOfWeek: "Monday",
        mealType: "breakfast",
        recipeId: new mongoose.Types.ObjectId(),
        notes: "Duplicate breakfast entry",
      })
    ).rejects.toMatchObject({
      code: 11000, // MongoDB duplicate key error code
    });
  });

  it("associates a meal plan with the correct user", async () => {

    // Create two users
    const user = await User.create({
      email: "owner@example.com",
      name: "Owner User",
      passwordHash: "hashed-password",
    });

    const otherUser = await User.create({
      email: "other@example.com",
      name: "Other User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for the first user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Search the database for one meal plan matching the query conditions

    // Check if the meal plan exists for the first user
    const foundForOwner = await MealPlan.findOne({
      _id: mealPlan._id,
      userId: user._id,
    });

    // Check if the meal plan exists for the second user
    const foundForOtherUser = await MealPlan.findOne({
      _id: mealPlan._id,
      userId: otherUser._id,
    });

    expect(foundForOwner).not.toBeNull(); // Check that the meal plan was successfully retrieved when queried by the first user
    expect(foundForOwner?.userId.toString()).toBe(user._id.toString()); // Check that the retrieved meal plan belongs to the first user
    expect(foundForOtherUser).toBeNull(); // Check that the meal plan was not retrieved when queried by the second user
  });

});