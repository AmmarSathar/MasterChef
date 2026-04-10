import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { CalendarEntry } from "../src/models/calendar-entry.model.js";
import {
  getCalendarWeek,
  upsertCalendarEntry,
  removeCalendarEntry,
} from "../src/services/calendar.service.js";

describe("Calendar service", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await Recipe.init();
    await CalendarEntry.init();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await CalendarEntry.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ── Helpers ────────────────────────────────────────────────────

  async function createUser(email: string) {
    return User.create({ email, name: "Test User", passwordHash: "hashed-password" });
  }

  async function createRecipe(userId: mongoose.Types.ObjectId, overrides: Record<string, unknown> = {}) {
    return Recipe.create({
      title: "Test Recipe",
      description: "A test recipe",
      ingredients: [{ foodItem: "eggs", amount: 2, unit: "unit" }],
      steps: ["Cook"],
      cookingTime: 10,
      servings: 2,
      skillLevel: "beginner",
      createdBy: userId,
      isPublic: false,
      ...overrides,
    });
  }

  // ── getCalendarWeek ────────────────────────────────────────────

  describe("getCalendarWeek", () => {
    it("returns empty days for a week with no assignments", async () => {
      const user = await createUser("empty-week@example.com");

      // 2026-04-05 is a Sunday (UTC day 0)
      const result = await getCalendarWeek(user._id.toString(), "2026-04-05");

      expect(result.weekStartDate).toBe("2026-04-05");
      expect(Object.keys(result.days)).toHaveLength(7);

      // All slots should be null
      for (const day of Object.values(result.days)) {
        expect(day.breakfast).toBeNull();
        expect(day.lunch).toBeNull();
        expect(day.dinner).toBeNull();
      }
    });

    it("returns populated slots for a week with assignments", async () => {
      const user = await createUser("populated-week@example.com");
      const recipe = await createRecipe(user._id, { title: "Sunday Brunch" });

      // Insert a calendar entry for the Sunday of that week
      await CalendarEntry.create({
        userId: user._id,
        date: new Date("2026-04-05T00:00:00.000Z"),
        mealType: "breakfast",
        recipeId: recipe._id,
        notes: "brunch note",
      });

      const result = await getCalendarWeek(user._id.toString(), "2026-04-05");

      const sundaySlot = result.days["2026-04-05"];
      expect(sundaySlot).toBeDefined();
      expect(sundaySlot.breakfast).not.toBeNull();
      expect(sundaySlot.breakfast?.title).toBe("Sunday Brunch");
      expect(sundaySlot.breakfast?.notes).toBe("brunch note");
      expect(sundaySlot.lunch).toBeNull();
    });

    it("rejects a non-Sunday date with 400", async () => {
      const user = await createUser("non-sunday@example.com");

      // 2026-04-06 is a Monday (UTC day 1)
      await expect(
        getCalendarWeek(user._id.toString(), "2026-04-06")
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Sunday") });
    });

    it("rejects an invalid date string with 400", async () => {
      const user = await createUser("invalid-date@example.com");

      await expect(
        getCalendarWeek(user._id.toString(), "not-a-date")
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("does not return another user's entries", async () => {
      const owner = await createUser("owner-cal@example.com");
      const other = await createUser("other-cal@example.com");
      const recipe = await createRecipe(owner._id);

      await CalendarEntry.create({
        userId: owner._id,
        date: new Date("2026-04-05T00:00:00.000Z"),
        mealType: "lunch",
        recipeId: recipe._id,
      });

      const result = await getCalendarWeek(other._id.toString(), "2026-04-05");
      expect(result.days["2026-04-05"].lunch).toBeNull();
    });
  });

  // ── upsertCalendarEntry ────────────────────────────────────────

  describe("upsertCalendarEntry", () => {
    it("creates a new calendar entry", async () => {
      const user = await createUser("create-cal@example.com");
      const recipe = await createRecipe(user._id, { title: "Omelette" });

      const result = await upsertCalendarEntry({
        userId: user._id.toString(),
        dateStr: "2026-04-06",
        mealType: "breakfast",
        recipeId: recipe._id.toString(),
        notes: "quick meal",
      });

      expect(result.title).toBe("Omelette");
      expect(result.notes).toBe("quick meal");
      expect(result.entryId).toBeTruthy();
      expect(result.recipeId).toBe(recipe._id.toString());
    });

    it("replaces an existing entry in the same slot (upsert)", async () => {
      const user = await createUser("upsert-cal@example.com");
      const recipe1 = await createRecipe(user._id, { title: "First Meal" });
      const recipe2 = await createRecipe(user._id, { title: "Second Meal" });

      // Create initial entry
      const first = await upsertCalendarEntry({
        userId: user._id.toString(),
        dateStr: "2026-04-06",
        mealType: "lunch",
        recipeId: recipe1._id.toString(),
      });

      // Replace with second recipe
      const second = await upsertCalendarEntry({
        userId: user._id.toString(),
        dateStr: "2026-04-06",
        mealType: "lunch",
        recipeId: recipe2._id.toString(),
      });

      expect(second.title).toBe("Second Meal");

      // DB should only have one entry for this slot
      const count = await CalendarEntry.countDocuments({
        userId: user._id,
        date: new Date("2026-04-06T00:00:00.000Z"),
        mealType: "lunch",
      });
      expect(count).toBe(1);
      expect(first.entryId).toBe(second.entryId); // same document updated
    });

    it("rejects an invalid mealType with 400", async () => {
      const user = await createUser("bad-mealtype@example.com");
      const recipe = await createRecipe(user._id);

      await expect(
        upsertCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-06",
          mealType: "snack" as never,
          recipeId: recipe._id.toString(),
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects an invalid recipe ID format with 400", async () => {
      const user = await createUser("bad-recipeid@example.com");

      await expect(
        upsertCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-06",
          mealType: "dinner",
          recipeId: "not-an-id",
        })
      ).rejects.toMatchObject({ statusCode: 400, message: "Invalid recipe ID" });
    });

    it("rejects a non-existent recipe with 404", async () => {
      const user = await createUser("missing-recipe@example.com");
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        upsertCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-06",
          mealType: "dinner",
          recipeId: fakeId,
        })
      ).rejects.toMatchObject({ statusCode: 404, message: "Recipe not found" });
    });

    it("rejects a private recipe owned by another user with 403", async () => {
      const user = await createUser("forbidden-recipe@example.com");
      const other = await createUser("other-owner@example.com");
      const privateRecipe = await createRecipe(other._id, { isPublic: false });

      await expect(
        upsertCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-06",
          mealType: "dinner",
          recipeId: privateRecipe._id.toString(),
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("allows assigning a public recipe owned by another user", async () => {
      const user = await createUser("public-recipe@example.com");
      const other = await createUser("public-owner@example.com");
      const publicRecipe = await createRecipe(other._id, { title: "Public Dish", isPublic: true });

      const result = await upsertCalendarEntry({
        userId: user._id.toString(),
        dateStr: "2026-04-06",
        mealType: "breakfast",
        recipeId: publicRecipe._id.toString(),
      });

      expect(result.title).toBe("Public Dish");
    });
  });

  // ── removeCalendarEntry ────────────────────────────────────────

  describe("removeCalendarEntry", () => {
    it("removes an existing calendar entry", async () => {
      const user = await createUser("remove-cal@example.com");
      const recipe = await createRecipe(user._id);

      await CalendarEntry.create({
        userId: user._id,
        date: new Date("2026-04-08T00:00:00.000Z"),
        mealType: "dinner",
        recipeId: recipe._id,
      });

      await removeCalendarEntry({
        userId: user._id.toString(),
        dateStr: "2026-04-08",
        mealType: "dinner",
      });

      const count = await CalendarEntry.countDocuments({
        userId: user._id,
        date: new Date("2026-04-08T00:00:00.000Z"),
        mealType: "dinner",
      });
      expect(count).toBe(0);
    });

    it("rejects a non-existent entry with 404", async () => {
      const user = await createUser("missing-remove@example.com");

      await expect(
        removeCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-08",
          mealType: "lunch",
        })
      ).rejects.toMatchObject({ statusCode: 404, message: "Calendar entry not found" });
    });

    it("rejects an invalid mealType with 400", async () => {
      const user = await createUser("bad-remove-type@example.com");

      await expect(
        removeCalendarEntry({
          userId: user._id.toString(),
          dateStr: "2026-04-07",
          mealType: "snack" as never,
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
