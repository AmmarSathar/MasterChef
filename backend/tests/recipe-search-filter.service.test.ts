import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { getRecipes, searchRecipes } from "../src/services/recipe.service.js";

describe("Recipe search and filters (US.05 / US.06)", () => {
  let mongoServer: MongoMemoryServer;
  let ownerId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await Recipe.init();
  });

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});

    const owner = await User.create({
      email: "seed-owner@test.com",
      name: "Seed Owner",
      passwordHash: "hash",
    });
    ownerId = owner._id.toString();

    const seeds = [
      {
        title: "Creamy Pasta Alfredo",
        description: "Rich pasta with cream sauce",
        ingredients: [{ foodItem: "Pasta", amount: 200, unit: "g" }],
        cookingTime: 20,
        skillLevel: "beginner",
        dietaryTags: ["vegetarian"],
      },
      {
        title: "Chicken Pasta Primavera",
        description: "Chicken and pasta in one pan",
        ingredients: [{ foodItem: "Chicken Breast", amount: 250, unit: "g" }],
        cookingTime: 35,
        skillLevel: "intermediate",
        dietaryTags: [],
      },
      {
        title: "Vegan Chickpea Bowl",
        description: "Protein-rich vegan bowl",
        ingredients: [{ foodItem: "Chickpeas", amount: 200, unit: "g" }],
        cookingTime: 25,
        skillLevel: "beginner",
        dietaryTags: ["vegan"],
      },
      {
        title: "Quick Tomato Soup",
        description: "Simple 15-minute soup",
        ingredients: [{ foodItem: "Tomato", amount: 4, unit: "unit" }],
        cookingTime: 15,
        skillLevel: "beginner",
        dietaryTags: ["vegetarian", "gluten-free"],
      },
      {
        title: "Beef Stew",
        description: "Slow-cooked comfort meal",
        ingredients: [{ foodItem: "Beef", amount: 400, unit: "g" }],
        cookingTime: 90,
        skillLevel: "advanced",
        dietaryTags: [],
      },
      {
        title: "Mushroom Risotto",
        description: "Creamy rice dish",
        ingredients: [{ foodItem: "Mushroom", amount: 200, unit: "g" }],
        cookingTime: 40,
        skillLevel: "intermediate",
        dietaryTags: ["vegetarian"],
      },
      {
        title: "Chicken Stir Fry",
        description: "Chicken with vegetables",
        ingredients: [{ foodItem: "Chicken", amount: 300, unit: "g" }],
        cookingTime: 30,
        skillLevel: "intermediate",
        dietaryTags: [],
      },
      {
        title: "Gluten-Free Pancakes",
        description: "Breakfast favorite",
        ingredients: [{ foodItem: "Gluten-Free Flour", amount: 150, unit: "g" }],
        cookingTime: 18,
        skillLevel: "beginner",
        dietaryTags: ["gluten-free", "vegetarian"],
      },
      {
        title: "Tofu Curry",
        description: "Spiced tofu curry",
        ingredients: [{ foodItem: "Tofu", amount: 250, unit: "g" }],
        cookingTime: 45,
        skillLevel: "intermediate",
        dietaryTags: ["vegan", "vegetarian"],
      },
      {
        title: "Pasta Salad",
        description: "Cold pasta for lunch",
        ingredients: [{ foodItem: "Pasta", amount: 200, unit: "g" }],
        cookingTime: 12,
        skillLevel: "beginner",
        dietaryTags: ["vegetarian"],
      },
    ];

    await Recipe.insertMany(
      seeds.map((seed) => ({
        title: seed.title,
        description: seed.description,
        ingredients: seed.ingredients,
        steps: ["Step 1", "Step 2"],
        cookingTime: seed.cookingTime,
        servings: 2,
        skillLevel: seed.skillLevel,
        dietaryTags: seed.dietaryTags,
        containsAllergens: [],
        isPublic: true,
        createdBy: ownerId,
      })),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("searches by keyword across title, description, and ingredients (case-insensitive)", async () => {
    const pasta = await searchRecipes({ q: "PaStA" });
    expect(pasta.recipes.length).toBeGreaterThanOrEqual(3);
    expect(pasta.recipes.some((r) => r.title.includes("Pasta"))).toBe(true);
    expect(pasta.recipes.some((r) => r.title === "Beef Stew")).toBe(false);
  });

  it("applies filters individually (time, difficulty alias, dietary tags)", async () => {
    const max30 = await getRecipes({ max_time: 30 });
    expect(max30.recipes.length).toBeGreaterThan(0);
    expect(max30.recipes.every((r) => r.cookingTime <= 30)).toBe(true);

    const mediumAlias = await getRecipes({ difficulty: "intermediate" });
    expect(mediumAlias.recipes.length).toBeGreaterThan(0);
    expect(mediumAlias.recipes.every((r) => r.skillLevel === "intermediate")).toBe(
      true,
    );

    const vegetarian = await getRecipes({ dietary_tags: ["vegetarian"] });
    expect(vegetarian.recipes.length).toBeGreaterThan(0);
    expect(
      vegetarian.recipes.every((r) => r.dietaryTags.includes("vegetarian")),
    ).toBe(true);
  });

  it("applies combined search + filters with AND logic and supports clear/no-results behavior", async () => {
    const combined = await getRecipes({
      search: "chicken",
      max_time: 45,
      difficulty: "intermediate",
    });

    expect(combined.recipes.length).toBeGreaterThanOrEqual(1);
    expect(
      combined.recipes.every(
        (r) =>
          r.cookingTime <= 45 &&
          r.skillLevel === "intermediate" &&
          `${r.title} ${r.description}`.toLowerCase().includes("chicken"),
      ),
    ).toBe(true);

    const noResults = await getRecipes({
      search: "chicken",
      max_time: 10,
      difficulty: "expert",
    });
    expect(noResults.recipes.length).toBe(0);

    const all = await getRecipes({});
    expect(all.total).toBe(10);

    const ownerAll = await getRecipes({ createdBy: ownerId });
    expect(ownerAll.total).toBe(10);
  });
});

