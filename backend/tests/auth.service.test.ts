import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import { registerUser, loginUser, updateUserProfile } from "../src/services/auth.service.js";
import { User } from "../src/models/user.model.js";
import { Profile } from "../src/models/profile.model.js";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../src/models/user.model.js", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../src/models/profile.model.js", () => ({
  Profile: {
    findOneAndUpdate: vi.fn(),
  },
}));

const mockedUser = User as unknown as {
  findOne: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findByIdAndUpdate: ReturnType<typeof vi.fn>;
};

const mockedProfile = Profile as unknown as {
  findOneAndUpdate: ReturnType<typeof vi.fn>;
};

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 400 when required fields are missing", async () => {
    await expect(
      registerUser({ email: "", password: "Password1!", name: "" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 for invalid email", async () => {
    await expect(
      registerUser({ email: "not-an-email", password: "Password1!", name: "A" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 for short password", async () => {
    await expect(
      registerUser({ email: "a@b.com", password: "short", name: "A" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 409 when email already exists", async () => {
    mockedUser.findOne.mockResolvedValue({ id: "existing" });

    await expect(
      registerUser({ email: "a@b.com", password: "Password1!", name: "A" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("creates a user and returns sanitized response", async () => {
    mockedUser.findOne.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password");
    mockedUser.create.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "a@b.com",
      name: "Alice",
    });

    const result = await registerUser({
      email: "a@b.com",
      password: "Password1!",
      name: "Alice",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("Password1!", 10);
    expect(mockedUser.create).toHaveBeenCalledWith({
      email: "a@b.com",
      name: "Alice",
      passwordHash: "hashed-password",
    });
    expect(result).toEqual({
      id: "user-id",
      email: "a@b.com",
      name: "Alice",
    });
  });
});

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 400 when required fields are missing", async () => {
    await expect(
      loginUser({ email: "", password: "Password1!" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 for invalid email", async () => {
    await expect(
      loginUser({ email: "not-an-email", password: "Password1!" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 401 for unknown user", async () => {
    mockedUser.findOne.mockResolvedValue(null);

    await expect(
      loginUser({ email: "a@b.com", password: "Password1!" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 for wrong password", async () => {
    mockedUser.findOne.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "a@b.com",
      name: "Alice",
      passwordHash: "hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    await expect(
      loginUser({ email: "a@b.com", password: "WrongPass1!" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("returns user for valid credentials", async () => {
    mockedUser.findOne.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "a@b.com",
      name: "Alice",
      passwordHash: "hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);

    const result = await loginUser({
      email: "a@b.com",
      password: "Password1!",
    });

    expect(result).toEqual({
      id: "user-id",
      email: "a@b.com",
      name: "Alice",
    });
  });
});

describe("updateUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates legacy users when userId is a Mongo ObjectId", async () => {
    mockedUser.findByIdAndUpdate.mockResolvedValue({
      _id: { toString: () => "67b77c0a876543210fedcba9" },
      email: "legacy@user.com",
      name: "Legacy User",
      isCustomized: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const result = await updateUserProfile({
      userId: "67b77c0a876543210fedcba9",
      isCustomized: true,
    });

    expect(mockedUser.findByIdAndUpdate).toHaveBeenCalled();
    expect(result.id).toBe("67b77c0a876543210fedcba9");
    expect(result.email).toBe("legacy@user.com");
  });

  it("updates Google-auth users through Profile.authUserId", async () => {
    mockedUser.findByIdAndUpdate.mockResolvedValue(null);
    mockedProfile.findOneAndUpdate.mockResolvedValue({
      authUserId: "auth_google_123",
      email: "google@user.com",
      name: "Google User",
      cuisines_pref: ["italian"],
      isCustomized: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const result = await updateUserProfile({
      userId: "auth_google_123",
      cuisines_pref: ["italian"],
      isCustomized: true,
    });

    expect(mockedProfile.findOneAndUpdate).toHaveBeenCalledWith(
      { authUserId: "auth_google_123" },
      { $set: { cuisines_pref: ["italian"], isCustomized: true } },
      { new: true, runValidators: true }
    );
    expect(result.id).toBe("auth_google_123");
    expect(result.isCustomized).toBe(true);
  });
});
