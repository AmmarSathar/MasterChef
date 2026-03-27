import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipes,
  searchRecipes,
} from "../src/services/recipe.service.js";

describe("Recipe service (US.04)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await Recipe.init();
  });

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  async function createUser(email: string, name = "Test User") {
    return User.create({
      email,
      name,
      passwordHash: "hash",
    });
  }

  function carbonaraInput(userId: string) {
    return {
      userId,
      title: "Spaghetti Carbonara",
      description: "Classic Italian pasta dish",
      ingredients: [
        { foodItem: "Spaghetti", amount: 200, unit: "g" },
        { foodItem: "Pancetta", amount: 100, unit: "g" },
        { foodItem: "Eggs", amount: 2, unit: "unit" },
        { foodItem: "Parmesan", amount: 50, unit: "g" },
      ],
      steps: [
        "Boil pasta",
        "Cook pancetta",
        "Mix eggs and cheese",
        "Combine all",
      ],
      cookingTime: 15,
      servings: 2,
      skillLevel: "intermediate",
      isShared: true,
    } as const;
  }

  it("creates, updates, and deletes a recipe for its owner", async () => {
    const owner = await createUser("owner-us04@test.com", "Owner");

    const created = await createRecipe(carbonaraInput(owner._id.toString()));
    expect(created.title).toBe("Spaghetti Carbonara");
    expect(created.createdBy).toBe(owner._id.toString());
    expect(created.createdByName).toBe("Owner");

    const ownerList = await getRecipes({ createdBy: owner._id.toString() });
    expect(ownerList.recipes.some((r) => r.id === created.id)).toBe(true);

    const updated = await updateRecipe({
      recipeId: created.id,
      userId: owner._id.toString(),
      title: "Authentic Spaghetti Carbonara",
      servings: 3,
    });

    expect(updated.title).toBe("Authentic Spaghetti Carbonara");
    expect(updated.servings).toBe(3);

    const fromDb = await getRecipeById(created.id);
    expect(fromDb.title).toBe("Authentic Spaghetti Carbonara");
    expect(fromDb.servings).toBe(3);

    await deleteRecipe(created.id, owner._id.toString());

    await expect(getRecipeById(created.id)).rejects.toMatchObject({
      message: "Recipe not found",
      statusCode: 404,
    });
  });

  it("blocks update and delete by non-owners", async () => {
    const owner = await createUser("owner-guard@test.com", "Owner");
    const other = await createUser("other-guard@test.com", "Other");

    const created = await createRecipe(carbonaraInput(owner._id.toString()));

    await expect(
      updateRecipe({
        recipeId: created.id,
        userId: other._id.toString(),
        title: "Should Not Work",
      }),
    ).rejects.toMatchObject({
      message: "You can only edit your own recipes",
      statusCode: 403,
    });

    await expect(
      deleteRecipe(created.id, other._id.toString()),
    ).rejects.toMatchObject({
      message: "You can only delete your own recipes",
      statusCode: 403,
    });
  });

  it("supports search and skill-level filtering for recipe listing", async () => {
    const owner = await createUser("filters@test.com");

    await createRecipe({
      ...carbonaraInput(owner._id.toString()),
      title: "Spaghetti Carbonara",
      skillLevel: "intermediate",
    });

    await createRecipe({
      ...carbonaraInput(owner._id.toString()),
      title: "Quick Salad",
      description: "Simple salad",
      ingredients: [{ foodItem: "Lettuce", amount: 1, unit: "head" }],
      steps: ["Chop", "Serve"],
      skillLevel: "beginner",
      cookingTime: 5,
    });

    const search = await searchRecipes({ q: "carbonara" });
    expect(search.recipes.length).toBeGreaterThan(0);
    expect(search.recipes[0].title).toContain("Carbonara");

    const filtered = await getRecipes({
      createdBy: owner._id.toString(),
      skillLevel: "beginner",
    });
    expect(filtered.recipes.length).toBe(1);
    expect(filtered.recipes[0].title).toBe("Quick Salad");
  });
});

