import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.model.js";

describe("auth routes (integration)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("registers a user and persists it", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "Password1!", name: "Alice" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      user: { email: "a@b.com", name: "Alice" },
    });

    const stored = await User.findOne({ email: "a@b.com" });
    expect(stored).toBeTruthy();
    expect(stored?.passwordHash).toBeDefined();
  });

  it("rejects duplicate emails", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@b.com", password: "Password1!", name: "Alice" });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@b.com", password: "Password1!", name: "Alice" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: "Email already registered",
    });
  });

  it("logs in a registered user", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@b.com", password: "Password1!", name: "Alice" });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@b.com", password: "Password1!" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      user: { email: "login@b.com", name: "Alice" },
    });
  });

  it("rejects invalid login credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "bad@b.com", password: "Password1!", name: "Alice" });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "bad@b.com", password: "WrongPass1!" });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: "Invalid credentials",
    });
  });
});
