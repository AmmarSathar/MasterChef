import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";
import { MealPlanEntry } from "../src/models/meal-plan-entry.model.js";
import { createMealPlanEntry, getMealPlanByWeek } from "../src/services/meal-plan.service.js";
import { assertMealPlanAccess } from "../src/services/meal-plan.service.js";

describe("MealPlanEntry service", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await Recipe.init();
    await MealPlan.init();
    await MealPlanEntry.init();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
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
    await Recipe.deleteMany({});
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

  // Helper function to create a test recipe
  async function createTestRecipe(userId: mongoose.Types.ObjectId, overrides: Partial<Record<string, unknown>> = {} ) {
    return Recipe.create({
      title: "Test Recipe",
      description: "A simple recipe for testing",
      ingredients: [
        { foodItem: "eggs", amount: 2, unit: "unit" },
        { foodItem: "bread", amount: 1, unit: "slice" }
      ],
      steps: ["Crack eggs", "Cook eggs", "Serve"],
      cookingTime: 15,
      servings: 2,
      skillLevel: "beginner",
      createdBy: userId,
      isPublic: false,
      ...overrides,
    });
  }

  it("successfully assigns a recipe to a meal plan slot", async () => {
    
    // Create a user
    const user = await User.create({
      email: "assign@example.com",
      name: "Assign User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create a recipe for that user
    const recipe = await createTestRecipe(user._id, {
      title: "Test Recipe",
    });

    // Attempt to assign the recipe to a meal plan slot
    const result = await createMealPlanEntry({
      mealPlanId: mealPlan._id.toString(),
      userId: user._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe._id.toString(),
      notes: "Quick breakfast",
    });

    // Verify the response
    expect(result).toMatchObject({
      mealPlanId: mealPlan._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe._id.toString(),
      notes: "Quick breakfast",
    });

    const entryInDb = await MealPlanEntry.findById(result.id); // Check that the retrieved entry has correct associations
    expect(entryInDb).not.toBeNull(); // Entry should exist in database
    expect(entryInDb?.mealPlanId.toString()).toBe(mealPlan._id.toString()); // Entry should be associated with correct meal plan
    expect(entryInDb?.recipeId.toString()).toBe(recipe._id.toString()); // Entry should be associated with correct recipe
  });

  it("prevents duplicate assignment to the same slot with a 409 error", async () => {

    // Create a user
    const user = await User.create({
      email: "duplicate-slot@example.com",
      name: "Duplicate Slot User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create two recipes for that user
    const recipe1 = await createTestRecipe(user._id, {
      title: "Test Recipe 1",
    });

    const recipe2 = await createTestRecipe(user._id, {
      title: "Test Recipe 2",
    });

    // Assign the first recipe to Monday breakfast
    await createMealPlanEntry({
      mealPlanId: mealPlan._id.toString(),
      userId: user._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe1._id.toString(),
      notes: "First recipe",
    });

    // Attempt to assign the second recipe to the same Monday breakfast slot (should fail with 409)
    await expect(
      createMealPlanEntry({
        mealPlanId: mealPlan._id.toString(),
        userId: user._id.toString(),
        dayOfWeek: "Monday",
        mealType: "breakfast",
        recipeId: recipe2._id.toString(),
        notes: "Duplicate slot attempt",
      })
    ).rejects.toMatchObject({
      message: "A recipe is already assigned to this slot",
      statusCode: 409,
    });
  });

  it("user can only assign to their own meal plan", async () => {
    
    // Create two users
    const owner = await User.create({
      email: "owner-assign@example.com",
      name: "Owner User",
      passwordHash: "hashed-password",
    });

    const otherUser = await User.create({
      email: "other-assign@example.com",
      name: "Other User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for the owner
    const mealPlan = await MealPlan.create({
      userId: owner._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create a recipe for the other user
    const recipe = await createTestRecipe(otherUser._id, {
      title: "Test Recipe",
      isPublic: true,
    });

    // Attempt to assign the other user's recipe to the owner's meal plan (should fail with 403)
    await expect(
      createMealPlanEntry({
        mealPlanId: mealPlan._id.toString(),
        userId: otherUser._id.toString(),
        dayOfWeek: "Tuesday",
        mealType: "lunch",
        recipeId: recipe._id.toString(),
        notes: "Unauthorized assignment",
      })
    ).rejects.toMatchObject({
      message: "You do not own this meal plan",
      statusCode: 403,
    });
  });

  it("handles invalid recipe_id with a 400 error", async () => {

    // Create a user
    const user = await User.create({
      email: "invalid-recipe@example.com",
      name: "Invalid Recipe User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Attempt to assign a recipe with an invalid recipe_id format (should fail with 400)
    await expect(
      createMealPlanEntry({
        mealPlanId: mealPlan._id.toString(),
        userId: user._id.toString(),
        dayOfWeek: "Wednesday",
        mealType: "dinner",
        recipeId: "not-a-valid-object-id",
        notes: "Bad recipe id",
      })
    ).rejects.toMatchObject({
      message: "Invalid recipe ID",
      statusCode: 400,
    });
  });

  it("returns 404 when recipe_id is valid format but recipe does not exist", async () => {
    
    // Create a user
    const user = await User.create({
      email: "missing-recipe@example.com",
      name: "Missing Recipe User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Generate a valid ObjectId that does not correspond to any existing recipe
    const missingRecipeId = new mongoose.Types.ObjectId();

    // Attempt to assign a recipe that does not exist (should fail with 404)
    await expect(
      createMealPlanEntry({
        mealPlanId: mealPlan._id.toString(),
        userId: user._id.toString(),
        dayOfWeek: "Thursday",
        mealType: "snack",
        recipeId: missingRecipeId.toString(),
        notes: "Recipe does not exist",
      })
    ).rejects.toMatchObject({
      message: "Recipe not found",
      statusCode: 404,
    });
  });

  it("returns the current week's meal plan with populated slot entry ids", async () => {
    const user = await User.create({
      email: "meal-plan-week@example.com",
      name: "Meal Plan Week User",
      passwordHash: "hashed-password",
    });

    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    const recipe = await createTestRecipe(user._id, {
      title: "Week Lookup Recipe",
    });

    const createdEntry = await createMealPlanEntry({
      mealPlanId: mealPlan._id.toString(),
      userId: user._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: recipe._id.toString(),
      notes: "Loaded from week lookup",
    });

    const result = await getMealPlanByWeek(
      user._id.toString(),
      "2026-03-09T00:00:00.000Z"
    );

    expect(result.id).toBe(mealPlan._id.toString());
    expect(result.days.Monday.breakfast).toMatchObject({
      entryId: createdEntry.id,
      recipeId: recipe._id.toString(),
      title: "Week Lookup Recipe",
      notes: "Loaded from week lookup",
    });
  });

});
