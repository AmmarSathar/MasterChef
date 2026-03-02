import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { updateProfile, setPassword } from "../src/controllers/auth.controller.js";
import { updateUserProfile } from "../src/services/auth.service.js";

const mockSetPassword = vi.hoisted(() => vi.fn());

vi.mock("../src/services/auth.service.js", () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock("../src/lib/auth.js", () => ({
  getAuth: vi.fn().mockReturnValue({
    api: { setPassword: mockSetPassword },
  }),
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: vi.fn().mockReturnValue(new Headers()),
}));

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

function makeAuthReq(body = {}) {
  return {
    body,
    headers: {},
    session: {
      user: { id: "507f1f77bcf86cd799439011", name: "Alice", email: "a@b.com" },
      session: { id: "s1", userId: "507f1f77bcf86cd799439011", expiresAt: new Date() },
    },
  } as unknown as Request;
}

describe("updateProfile", () => {
  it("returns 200 with updated user on success", async () => {
    const req = makeAuthReq({ name: "Alice" });
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    vi.mocked(updateUserProfile).mockResolvedValue({ name: "Alice", email: "a@b.com" });

    await updateProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { name: "Alice", email: "a@b.com" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next with error on failure", async () => {
    const req = makeAuthReq();
    const res = createResponse();
    const next = vi.fn() as NextFunction;
    const error = new Error("db error");

    vi.mocked(updateUserProfile).mockRejectedValue(error);

    await updateProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("setPassword", () => {
  it("returns 400 when newPassword is missing", async () => {
    const req = { body: {}, headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await setPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "newPassword is required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 on success", async () => {
    const req = { body: { newPassword: "NewPass1!" }, headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    mockSetPassword.mockResolvedValue(undefined);

    await setPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("returns 409 when user already has a password", async () => {
    const req = { body: { newPassword: "NewPass1!" }, headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    mockSetPassword.mockRejectedValue(new Error("user already has a password"));

    await setPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "PASSWORD_ALREADY_SET" });
  });

  it("calls next with unexpected errors", async () => {
    const req = { body: { newPassword: "NewPass1!" }, headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;
    const error = new Error("unexpected");

    mockSetPassword.mockRejectedValue(error);

    await setPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
