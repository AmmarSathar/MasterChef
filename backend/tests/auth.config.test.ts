import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

const capturedConfigs: Array<Record<string, unknown>> = [];

vi.mock("better-auth", () => ({
  betterAuth: vi.fn((config: Record<string, unknown>) => {
    capturedConfigs.push(config);
    return { api: {} };
  }),
}));

vi.mock("better-auth/adapters/mongodb", () => ({
  mongodbAdapter: vi.fn(() => ({ adapter: "mongo" })),
}));

function stubDb(value: unknown) {
  Object.defineProperty(mongoose.connection, "db", {
    get: () => value,
    configurable: true,
  });
}

describe("BetterAuth configuration", () => {
  beforeEach(() => {
    capturedConfigs.length = 0;
    stubDb({});
  });

  it("enables email/password and configures OAuth providers", async () => {
    process.env.BETTER_AUTH_SECRET = "test-secret";
    process.env.BETTER_AUTH_URL = "http://localhost:4000";
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.GOOGLE_CLIENT_ID = "test-google-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
    process.env.GH_CLIENT_ID = "test-github-id";
    process.env.GH_CLIENT_SECRET = "test-github-secret";

    vi.resetModules();
    const { getAuth } = await import("../src/lib/auth.js");

    getAuth();

    expect(capturedConfigs.length).toBe(1);
    const config = capturedConfigs[0];

    expect(config.emailAndPassword).toMatchObject({ enabled: true });
    expect(config.trustedOrigins).toEqual(["http://localhost:3000"]);

    const providers = config.socialProviders as Record<string, any>;
    expect(providers.google.clientId).toBe("test-google-id");
    expect(providers.google.clientSecret).toBe("test-google-secret");
    expect(providers.github.clientId).toBe("test-github-id");
    expect(providers.github.clientSecret).toBe("test-github-secret");
    expect(providers.github.scope).toContain("user:email");

    const account = config.account as Record<string, any>;
    expect(account.accountLinking).toMatchObject({
      enabled: true,
      trustedProviders: ["google", "github"],
    });
  });
});
