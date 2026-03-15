import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";

describe("MealPlan model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    // Ensure indexes are built before duplicate-key tests
    await User.init();
    await MealPlan.init();
  });

  afterEach(async () => {
    // Clean up after each test
    await MealPlan.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Set up a valid user and meal plan for testing
  it("creates a meal plan successfully", async () => {
    
    // Create user document
    const user = await User.create({
      email: "mealplan1@example.com",
      name: "Meal Planner",
      passwordHash: "hashed-password",
    });

    // Create Date object
    const weekStartDate = new Date("2026-03-09T00:00:00.000Z");

    // Create MealPlan document
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate,
    });

    // Verify meal plan was created correctly
    expect(mealPlan).toBeDefined();
    expect(mealPlan.userId.toString()).toBe(user._id.toString());
    expect(new Date(mealPlan.weekStartDate).toISOString()).toBe(
      weekStartDate.toISOString()
    );
    expect(mealPlan).toHaveProperty("createdAt");
    expect(mealPlan).toHaveProperty("updatedAt");
  });

});