import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MealPlan } from "../src/models/meal-plan.model.js";

describe("MealPlan model", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await MealPlan.init();
  });

  beforeEach(async () => {
    await MealPlan.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
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
});
