import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

const mockGetSession = vi.fn();
const mockSetPassword = vi.fn();

vi.mock("../src/lib/auth.js", () => ({
  getAuth: vi.fn(() => ({
    api: {
      getSession: mockGetSession,
      setPassword: mockSetPassword,
    },
  })),
}));

vi.mock("better-auth/node", () => ({
  toNodeHandler: vi.fn(() => (_req: unknown, res: { end(): void }) => res.end()),
  fromNodeHeaders: vi.fn(() => new Headers()),
}));

import app from "../src/app.js";

const USER_ID = "507f1f77bcf86cd799439011";

describe("user routes (integration)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    mockGetSession.mockReset();
    mockSetPassword.mockReset();
    await mongoose.connection.db?.collection("user").deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const fakeSession = () => ({
    user: { id: USER_ID, name: "Alice", email: "a@b.com" },
    session: { id: "s1", userId: USER_ID, expiresAt: new Date() },
  });

  describe("PUT /api/user/profile", () => {
    it("returns 401 when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const res = await request(app).put("/api/user/profile").send({ name: "Alice" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: "Unauthorized" });
    });

    it("returns 404 when user is not in DB", async () => {
      mockGetSession.mockResolvedValue(fakeSession());

      const res = await request(app).put("/api/user/profile").send({ name: "Alice" });

      expect(res.status).toBe(404);
    });

    it("returns 200 with updated user on success", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      await mongoose.connection.db!.collection("user").insertOne({
        _id: new mongoose.Types.ObjectId(USER_ID),
        email: "a@b.com",
        name: "Alice",
      });

      const res = await request(app)
        .put("/api/user/profile")
        .send({ name: "Alice Updated", bio: "Chef" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        user: { email: "a@b.com", name: "Alice Updated", bio: "Chef" },
      });
      expect(res.body.user).not.toHaveProperty("_id");
    });
  });

  describe("POST /api/user/set-password", () => {
    it("returns 401 when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/user/set-password")
        .send({ newPassword: "NewPass1!" });

      expect(res.status).toBe(401);
    });

    it("returns 400 when newPassword is missing", async () => {
      mockGetSession.mockResolvedValue(fakeSession());

      const res = await request(app).post("/api/user/set-password").send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: "newPassword is required" });
    });

    it("returns 200 on success", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      mockSetPassword.mockResolvedValue(undefined);

      const res = await request(app)
        .post("/api/user/set-password")
        .send({ newPassword: "NewPass1!" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true });
    });

    it("returns 409 when password already set", async () => {
      mockGetSession.mockResolvedValue(fakeSession());
      mockSetPassword.mockRejectedValue(new Error("user already has a password"));

      const res = await request(app)
        .post("/api/user/set-password")
        .send({ newPassword: "NewPass1!" });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ error: "PASSWORD_ALREADY_SET" });
    });
  });
});
