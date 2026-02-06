import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { register } from "../auth.controller.js";
import { registerUser } from "../../services/auth.service.js";

vi.mock("../../services/auth.service.js", () => ({
  registerUser: vi.fn(),
}));

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return res;
}

describe("auth controller - register", () => {
  it("returns 201 and user payload on success", async () => {
    const req = {
      body: { email: "a@b.com", password: "Password1!", name: "Alice" },
    } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    vi.mocked(registerUser).mockResolvedValue({
      id: "user-id",
      email: "a@b.com",
      name: "Alice",
    });

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { id: "user-id", email: "a@b.com", name: "Alice" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next with error on failure", async () => {
    const req = {
      body: { email: "a@b.com", password: "Password1!", name: "Alice" },
    } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;
    const error = Object.assign(new Error("boom"), { statusCode: 400 });

    vi.mocked(registerUser).mockRejectedValue(error);

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
