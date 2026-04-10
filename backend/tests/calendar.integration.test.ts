import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// ── Auth mocks (must be hoisted above app import) ──────────────

const mockGetSession = vi.fn();
const mockAuthHandler = vi.fn((_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) => {
  res.status(200).json({ ok: true });
});

vi.mock("../src/lib/auth.js", () => ({
  getAuth: vi.fn(() => ({
    api: { getSession: mockGetSession },
  })),
}));

vi.mock("better-auth/node", () => ({
  toNodeHandler: vi.fn(() => mockAuthHandler),
  fromNodeHeaders: vi.fn(() => new Headers()),
}));

import app from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Recipe } from "../src/models/recipe.model.js";
import { CalendarEntry } from "../src/models/calendar-entry.model.js";

const USER_ID = "507f1f77bcf86cd799439011";

// ── Setup ──────────────────────────────────────────────────────

describe("Calendar routes (integration)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
    await Recipe.init();
    await CalendarEntry.init();
  });

  afterEach(async () => {
    mockGetSession.mockReset();
    await CalendarEntry.deleteMany({});
    await Recipe.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const fakeSession = () => ({
    user: { id: USER_ID, name: "Alice", email: "a@b.com" },
    session: { id: "s1", userId: USER_ID, expiresAt: new Date() },
  });

  async function seedUser() {
    return User.create({
      _id: new mongoose.Types.ObjectId(USER_ID),
      email: "a@b.com",
      name: "Alice",
      passwordHash: "hashed",
    });
  }

  async function seedRecipe(userId: string, overrides: Record<string, unknown> = {}) {
    return Recipe.create({
      title: "Test Recipe",
      description: "Desc",
      ingredients: [{ foodItem: "eggs", amount: 2, unit: "unit" }],
      steps: ["Cook"],
      cookingTime: 10,
      servings: 2,
      skillLevel: "beginner",
      createdBy: new mongoose.Types.ObjectId(userId),
      isPublic: false,
      ...overrides,
    });
  }

  // ── GET /api/calendar/week/:date ───────────────────────────────

  describe("GET /api/calendar/week/:date", () => {
    it("returns 401 without a session", async () => {
      mockGetSession.mockResolvedValue(null);

      const res = await request(app).get("/api/calendar/week/2026-04-05");

      expect(res.status).toBe(401);
    });

    it("returns 400 for a non-Sunday date", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();

      // 2026-04-06 is a Monday (UTC day 1)
      const res = await request(app).get("/api/calendar/week/2026-04-06");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Sunday/i);
    });

    it("returns 200 with empty days for a new week", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();

      const res = await request(app).get("/api/calendar/week/2026-04-05");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weekStartDate).toBe("2026-04-05");
      expect(Object.keys(res.body.data.days)).toHaveLength(7);
    });

    it("returns 200 with populated slots when entries exist", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const recipe = await seedRecipe(USER_ID, { title: "Monday Lunch" });

      await CalendarEntry.create({
        userId: new mongoose.Types.ObjectId(USER_ID),
        date: new Date("2026-04-05T00:00:00.000Z"),
        mealType: "breakfast",
        recipeId: recipe._id,
      });

      const res = await request(app).get("/api/calendar/week/2026-04-05");

      expect(res.status).toBe(200);
      const sunday = res.body.data.days["2026-04-05"];
      expect(sunday.breakfast).not.toBeNull();
      expect(sunday.breakfast.title).toBe("Monday Lunch");
    });
  });

  // ── PUT /api/calendar/:date/:mealType ──────────────────────────

  describe("PUT /api/calendar/:date/:mealType", () => {
    it("returns 401 without a session", async () => {
      mockGetSession.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/calendar/2026-04-07/breakfast")
        .send({ recipe_id: "some-id" });

      expect(res.status).toBe(401);
    });

    it("returns 400 when recipe_id is missing", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();

      const res = await request(app)
        .put("/api/calendar/2026-04-07/breakfast")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/recipe_id/i);
    });

    it("returns 404 when recipe does not exist", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .put("/api/calendar/2026-04-07/breakfast")
        .send({ recipe_id: fakeId });

      expect(res.status).toBe(404);
    });

    it("returns 200 and creates a new calendar entry", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const recipe = await seedRecipe(USER_ID, { title: "Omelette" });

      const res = await request(app)
        .put("/api/calendar/2026-04-07/breakfast")
        .send({ recipe_id: recipe._id.toString(), notes: "early bird" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Omelette");
      expect(res.body.data.notes).toBe("early bird");
    });

    it("returns 200 and replaces existing entry (upsert)", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const recipe1 = await seedRecipe(USER_ID, { title: "First" });
      const recipe2 = await seedRecipe(USER_ID, { title: "Second" });

      // First PUT
      await request(app)
        .put("/api/calendar/2026-04-07/lunch")
        .send({ recipe_id: recipe1._id.toString() });

      // Second PUT — replace
      const res = await request(app)
        .put("/api/calendar/2026-04-07/lunch")
        .send({ recipe_id: recipe2._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Second");

      const count = await CalendarEntry.countDocuments({
        userId: new mongoose.Types.ObjectId(USER_ID),
        mealType: "lunch",
      });
      expect(count).toBe(1);
    });

    it("returns 400 for an invalid mealType", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const recipe = await seedRecipe(USER_ID);

      const res = await request(app)
        .put("/api/calendar/2026-04-07/snack")
        .send({ recipe_id: recipe._id.toString() });

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/calendar/:date/:mealType ───────────────────────

  describe("DELETE /api/calendar/:date/:mealType", () => {
    it("returns 401 without a session", async () => {
      mockGetSession.mockResolvedValue(null);

      const res = await request(app).delete("/api/calendar/2026-04-08/dinner");

      expect(res.status).toBe(401);
    });

    it("returns 204 on successful deletion", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();
      const recipe = await seedRecipe(USER_ID);

      await CalendarEntry.create({
        userId: new mongoose.Types.ObjectId(USER_ID),
        date: new Date("2026-04-08T00:00:00.000Z"),
        mealType: "dinner",
        recipeId: recipe._id,
      });

      const res = await request(app).delete("/api/calendar/2026-04-08/dinner");

      expect(res.status).toBe(204);
      const count = await CalendarEntry.countDocuments();
      expect(count).toBe(0);
    });

    it("returns 404 when entry does not exist", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await seedUser();

      const res = await request(app).delete("/api/calendar/2026-04-08/dinner");

      expect(res.status).toBe(404);
    });
  });
});
