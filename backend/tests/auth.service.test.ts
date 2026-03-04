import { describe, it, expect, vi, afterEach } from "vitest";
import mongoose from "mongoose";
import { updateUserProfile } from "../src/services/auth.service.js";

describe("updateUserProfile", () => {
  afterEach(() => {
    // Remove any own-property override to restore the prototype getter
    delete (mongoose.connection as any).db;
  });

  function stubDb(value: unknown) {
    Object.defineProperty(mongoose.connection, "db", {
      get: () => value,
      configurable: true,
    });
  }

  it("throws 400 when userId is missing", async () => {
    await expect(
      updateUserProfile({ userId: "" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 500 when database is not connected", async () => {
    stubDb(null);

    await expect(
      updateUserProfile({ userId: "507f1f77bcf86cd799439011" })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("throws 404 when user is not found", async () => {
    const mockCollection = { findOneAndUpdate: vi.fn().mockResolvedValue(null) };
    stubDb({ collection: () => mockCollection });

    await expect(
      updateUserProfile({ userId: "507f1f77bcf86cd799439011", bio: "Chef" })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns updated user without _id on success", async () => {
    const mockCollection = {
      findOneAndUpdate: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
        email: "a@b.com",
        name: "Alice Updated",
        bio: "Chef",
      }),
    };
    stubDb({ collection: () => mockCollection });

    const result = await updateUserProfile({
      userId: "507f1f77bcf86cd799439011",
      bio: "Chef",
    });

    expect(result).toEqual({ email: "a@b.com", name: "Alice Updated", bio: "Chef" });
    expect(result).not.toHaveProperty("_id");
  });
});
