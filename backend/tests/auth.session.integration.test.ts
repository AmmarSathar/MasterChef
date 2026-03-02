import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

describe("BetterAuth session flows (integration)", () => {
  let mongoServer: MongoMemoryServer;
  let app: typeof import("../src/app.js").default;

  beforeAll(async () => {
    process.env.BETTER_AUTH_SECRET = "test-secret";
    process.env.BETTER_AUTH_URL = "http://localhost:4000";
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.GOOGLE_CLIENT_ID = "test-google-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
    process.env.GH_CLIENT_ID = "test-github-id";
    process.env.GH_CLIENT_SECRET = "test-github-secret";

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const mod = await import("../src/app.js");
    app = mod.default;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("returns null session when no cookie is present", async () => {
    const res = await request(app)
      .get("/api/auth/get-session")
      .set("Origin", "http://localhost:3000");

    expect(res.status).toBe(200);
    expect(res.body?.session ?? null).toBeNull();
    expect(res.body?.user ?? null).toBeNull();
  });

  it("supports email sign-up, session, sign-out, and sign-in", async () => {
    const agent = request.agent(app);
    const email = `test+${Date.now()}@example.com`;
    const password = "Password1!";
    const name = "Test User";

    const signUpRes = await agent
      .post("/api/auth/sign-up/email")
      .set("Origin", "http://localhost:3000")
      .send({ email, password, name });

    expect([200, 201]).toContain(signUpRes.status);
    expect(signUpRes.headers["set-cookie"]?.length ?? 0).toBeGreaterThan(0);

    const createdUser = await mongoose.connection.db
      ?.collection("user")
      .findOne({ email });
    expect(createdUser).toBeTruthy();

    const sessionRes = await agent
      .get("/api/auth/get-session")
      .set("Origin", "http://localhost:3000");
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body?.user?.email).toBe(email);

    const signOutRes = await agent
      .post("/api/auth/sign-out")
      .set("Origin", "http://localhost:3000")
      .send({});
    expect([200, 204]).toContain(signOutRes.status);

    const sessionAfterSignOut = await agent
      .get("/api/auth/get-session")
      .set("Origin", "http://localhost:3000");
    expect(sessionAfterSignOut.status).toBe(200);
    expect(sessionAfterSignOut.body?.session ?? null).toBeNull();
    expect(sessionAfterSignOut.body?.user ?? null).toBeNull();

    const signInRes = await agent
      .post("/api/auth/sign-in/email")
      .set("Origin", "http://localhost:3000")
      .send({ email, password });
    expect([200, 201]).toContain(signInRes.status);
    expect(signInRes.headers["set-cookie"]?.length ?? 0).toBeGreaterThan(0);

    const sessionAfterSignIn = await agent
      .get("/api/auth/get-session")
      .set("Origin", "http://localhost:3000");
    expect(sessionAfterSignIn.status).toBe(200);
    expect(sessionAfterSignIn.body?.user?.email).toBe(email);
  });
});
