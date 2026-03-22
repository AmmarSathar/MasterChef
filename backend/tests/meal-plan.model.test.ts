import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";
import { MealPlanEntry } from "../src/models/meal-plan-entry.model.js";
import { assertMealPlanAccess } from "../src/services/meal-plan.service.js";

describe("MealPlan model", () => {
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

  it("passes validation for a minimal valid meal plan", () => {
    const doc = new MealPlan({
      userId: new mongoose.Types.ObjectId(),
      weekStartDate: new Date(),
    });
    const error = doc.validateSync();

    expect(error).toBeUndefined();
  });

  it("stores a valid weekStartDate", async () => {
    const weekStartDate = new Date();
    const created = await MealPlan.create({
      userId: new mongoose.Types.ObjectId(),
      weekStartDate,
    });

    expect(created.weekStartDate instanceof Date).toBe(true);
    expect(created.weekStartDate.toISOString()).toBe(weekStartDate.toISOString());
  });

  it("associates creation with the correct userId", async () => {
    const userId = new mongoose.Types.ObjectId();
    const created = await MealPlan.create({
      userId,
      weekStartDate: new Date(),
    });

    expect(created.userId.toString()).toBe(userId.toString());
  });

  it("prevents duplicate meal plans for the same user and week", async () => {
    const userId = new mongoose.Types.ObjectId();
    const weekStartDate = new Date();

    await MealPlan.create({ userId, weekStartDate });

    await expect(
      MealPlan.create({ userId, weekStartDate })
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("fails validation for an invalid weekStartDate", () => {
    const doc = new MealPlan({
      userId: new mongoose.Types.ObjectId(),
      weekStartDate: "not-a-date" as unknown as Date,
    });
    const error = doc.validateSync();

    expect(error).toBeTruthy();
    expect(error?.errors.weekStartDate?.name).toBe("CastError");
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

    // Check if the meal plan exists for the first user (should be found) & second user (should not be found)
    await expect(
      assertMealPlanAccess(
        mealPlan._id.toString(),
        otherUser._id.toString()
      )
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("handles an empty meal plan with no entries", async () => {

    // Create a user
    const user = await User.create({
      email: "emptyplan@example.com",
      name: "Empty Plan User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for this user without adding any entries
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    const foundMealPlan = await MealPlan.findById(mealPlan._id); // Fetch the meal plan from the database
    const entries = await MealPlanEntry.find({ mealPlanId: mealPlan._id }); // Fetch all entries associated with this meal plan

    expect(foundMealPlan).not.toBeNull(); // Check that the meal plan was successfully retrieved
    expect(foundMealPlan?.userId.toString()).toBe(user._id.toString()); // Check that the retrieved meal plan belongs to the correct user
    expect(entries).toEqual([]); // Check that no entries are found for the empty meal plan
    expect(entries).toHaveLength(0); // Explicitly check that the length is 0
  });

  it("handles a non-existent meal plan ID when looking up an entry by composite ID", async () => {

    // Create a user
    const user = await User.create({
      email: "missingplan@example.com",
      name: "Missing Plan User",
      passwordHash: "hashed-password",
    });

    // Create a new ObjectId that is not in the database to simulate a non-existent meal plan ID
    const nonExistentMealPlanId = new mongoose.Types.ObjectId();

    // Attempt to find a meal plan entry using the non-existent meal plan ID (should throw 403 error)
    await expect(
      assertMealPlanAccess(
        nonExistentMealPlanId.toString(),
        user._id.toString()
      )
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

});