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

  it("associates a meal plan with the correct user", async () => {
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

    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    const foundForOwner = await MealPlan.findOne({
      _id: mealPlan._id,
      userId: user._id,
    });

    const foundForOtherUser = await MealPlan.findOne({
      _id: mealPlan._id,
      userId: otherUser._id,
    });

    expect(foundForOwner).not.toBeNull();
    expect(foundForOwner?.userId.toString()).toBe(user._id.toString());

    expect(foundForOtherUser).toBeNull();
  });

});