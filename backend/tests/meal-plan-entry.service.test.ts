import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { MealPlan } from "../src/models/meal-plan.model.js";
import { MealPlanEntry } from "../src/models/meal-plan-entry.model.js";
import { createMealPlanEntry,
         assertMealPlanAccess,
         updateMealPlanEntry,
         deleteMealPlanEntry
} from "../src/services/meal-plan.service.js";
import {  } from "../src/services/meal-plan.service.js";

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

  it("allows up to 3 recipes per slot and rejects a 4th with 409", async () => {

    // Create a user
    const user = await User.create({
      email: "max-slot@example.com",
      name: "Max Slot User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create four distinct recipes
    const recipes = await Promise.all(
      [1, 2, 3, 4].map((n) =>
        createTestRecipe(user._id, { title: `Slot Recipe ${n}` })
      )
    );

    // Assign first three — all should succeed
    for (let i = 0; i < 3; i++) {
      await expect(
        createMealPlanEntry({
          mealPlanId: mealPlan._id.toString(),
          userId: user._id.toString(),
          dayOfWeek: "Monday",
          mealType: "breakfast",
          recipeId: recipes[i]._id.toString(),
          notes: `Recipe ${i + 1}`,
        })
      ).resolves.toBeTruthy();
    }

    // Fourth assignment to the same slot must fail with 409
    await expect(
      createMealPlanEntry({
        mealPlanId: mealPlan._id.toString(),
        userId: user._id.toString(),
        dayOfWeek: "Monday",
        mealType: "breakfast",
        recipeId: recipes[3]._id.toString(),
        notes: "Over the limit",
      })
    ).rejects.toMatchObject({
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

  it("successfully updates a meal plan entry with a valid recipe_id", async () => {

    // Create a user
    const user = await User.create({
      email: "update-owner@example.com",
      name: "Update Owner",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create two recipes for that user
    const originalRecipe = await createTestRecipe(user._id, {
      title: "Original Recipe",
    });

    const newRecipe = await createTestRecipe(user._id, {
      title: "Updated Recipe",
    });

    // Create a meal plan entry with the original recipe
    const entry = await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: originalRecipe._id,
      notes: "Original notes",
    });

    // Attempt to update the meal plan entry to use the new recipe
    const result = await updateMealPlanEntry({
      entryId: entry._id.toString(),
      userId: user._id.toString(),
      recipeId: newRecipe._id.toString(),
      notes: "Updated notes",
    });

    // Verify the response
    expect(result).toMatchObject({
      id: entry._id.toString(),
      mealPlanId: mealPlan._id.toString(),
      dayOfWeek: "Monday",
      mealType: "breakfast",
      recipeId: newRecipe._id.toString(),
      notes: "Updated notes",
    });

    const updatedEntry = await MealPlanEntry.findById(entry._id); // Check that the entry was updated in database
    expect(updatedEntry).not.toBeNull(); // Updated entry should exist in database
    expect(updatedEntry?.recipeId.toString()).toBe(newRecipe._id.toString()); // Entry should be associated with the new recipe
    expect(updatedEntry?.notes).toBe("Updated notes"); // Notes should be updated
  });

  it("successfully deletes a meal plan entry", async () => {

    // Create a user
    const user = await User.create({
      email: "delete-owner@example.com",
      name: "Delete Owner",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for that user
    const mealPlan = await MealPlan.create({
      userId: user._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create a recipe for that user
    const recipe = await createTestRecipe(user._id, {
      title: "Delete Recipe",
    });

    // Create a meal plan entry to be deleted
    const entry = await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Tuesday",
      mealType: "lunch",
      recipeId: recipe._id,
      notes: "Delete this entry",
    });

    // Attempt to delete the meal plan entry
    await deleteMealPlanEntry({
      entryId: entry._id.toString(),
      userId: user._id.toString(),
    });

    const deletedEntry = await MealPlanEntry.findById(entry._id); // Check that the entry was deleted from database
    expect(deletedEntry).toBeNull(); // Entry should no longer exist in database
  });

  it("returns 403 on update when the user does not own the meal plan", async () => {

    // Create two users
    const owner = await User.create({
      email: "owner-update-403@example.com",
      name: "Owner User",
      passwordHash: "hashed-password",
    });

    const otherUser = await User.create({
      email: "other-update-403@example.com",
      name: "Other User",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for the owner
    const mealPlan = await MealPlan.create({
      userId: owner._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create a recipe for the owner and a public recipe for the other user
    const ownerRecipe = await createTestRecipe(owner._id, {
      title: "Owner Recipe",
    });

    const publicRecipe = await createTestRecipe(otherUser._id, {
      title: "Public Recipe",
      isPublic: true,
    });

    // Create a meal plan entry with the owner's recipe
    const entry = await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Wednesday",
      mealType: "dinner",
      recipeId: ownerRecipe._id,
      notes: "Original notes",
    });

    // Attempt to update meal plan entry using  other user's public recipe (should fail with 403)
    await expect(
      updateMealPlanEntry({
        entryId: entry._id.toString(),
        userId: otherUser._id.toString(),
        recipeId: publicRecipe._id.toString(),
        notes: "Unauthorized update",
      })
    ).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });

    const unchangedEntry = await MealPlanEntry.findById(entry._id); // Check that the entry was not updated in database
    expect(unchangedEntry?.recipeId.toString()).toBe(ownerRecipe._id.toString()); // Entry should still be associated with the original recipe
    expect(unchangedEntry?.notes).toBe("Original notes"); // Notes should not be updated
  });

  it("returns 403 on deletion when the user does not own the meal plan", async () => {

    // Create two users
    const owner = await User.create({
      email: "owner-delete-403@example.com",
      name: "Owner Delete",
      passwordHash: "hashed-password",
    });

    const otherUser = await User.create({
      email: "other-delete-403@example.com",
      name: "Other Delete",
      passwordHash: "hashed-password",
    });

    // Create a meal plan for the owner
    const mealPlan = await MealPlan.create({
      userId: owner._id,
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
    });

    // Create a recipe for the owner
    const recipe = await createTestRecipe(owner._id, {
      title: "Protected Recipe",
    });

    // Create a meal plan entry to be protected from deletion by the other user
    const entry = await MealPlanEntry.create({
      mealPlanId: mealPlan._id,
      dayOfWeek: "Thursday",
      mealType: "snack",
      recipeId: recipe._id,
      notes: "Protected entry",
    });

    // Attempt to delete the meal plan entry using the other user (should fail with 403)
    await expect(
      deleteMealPlanEntry({
        entryId: entry._id.toString(),
        userId: otherUser._id.toString(),
      })
    ).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });

    const stillExistingEntry = await MealPlanEntry.findById(entry._id); // Check that the entry was not deleted from database
    expect(stillExistingEntry).not.toBeNull(); // Entry should still exist in database
  });

  it("returns 404 on update when the meal plan entry ID does not exist", async () => {

    // Create a user
    const user = await User.create({
      email: "missing-update@example.com",
      name: "Missing Update User",
      passwordHash: "hashed-password",
    });

    // Create a recipe for that user
    const recipe = await createTestRecipe(user._id, {
      title: "Recipe For Missing Update",
    });

    const nonExistentEntryId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId that does not correspond to any existing meal plan entry

    // Attempt to update a meal plan entry that does not exist (should fail with 404)
    await expect(
      updateMealPlanEntry({
        entryId: nonExistentEntryId.toString(),
        userId: user._id.toString(),
        recipeId: recipe._id.toString(),
        notes: "Should fail",
      })
    ).rejects.toMatchObject({
      message: "Meal plan entry not found",
      statusCode: 404,
    });
  });

  it("returns 404 on deletion when the meal plan entry ID does not exist", async () => {

    // Create a user
    const user = await User.create({
      email: "missing-delete@example.com",
      name: "Missing Delete User",
      passwordHash: "hashed-password",
    });

    const nonExistentEntryId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId that does not correspond to any existing meal plan entry

    // Attempt to delete a meal plan entry that does not exist (should fail with 404)
    await expect(
      deleteMealPlanEntry({
        entryId: nonExistentEntryId.toString(),
        userId: user._id.toString(),
      })
    ).rejects.toMatchObject({
      message: "Meal plan entry not found",
      statusCode: 404,
    });
  });

});