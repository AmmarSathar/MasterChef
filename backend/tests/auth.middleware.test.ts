import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireSession, AuthenticatedRequest } from "../src/middleware/auth.middleware.js";

const mockGetSession = vi.fn();
const mockFromNodeHeaders = vi.fn();

vi.mock("../src/lib/auth.js", () => ({
  getAuth: vi.fn(() => ({
    api: { getSession: mockGetSession },
  })),
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: (...args: unknown[]) => mockFromNodeHeaders(...args),
}));

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

describe("requireSession", () => {
  afterEach(() => {
    mockGetSession.mockReset();
    mockFromNodeHeaders.mockReset();
  });

  it("returns 401 when no session", async () => {
    const req = { headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    mockFromNodeHeaders.mockReturnValue(new Headers());
    mockGetSession.mockResolvedValue(null);

    await requireSession(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches session and calls next when session exists", async () => {
    const req = { headers: { cookie: "session=abc" } } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;
    const session = {
      user: { id: "u1", name: "Alice", email: "a@b.com" },
      session: { id: "s1", userId: "u1", expiresAt: new Date() },
    };

    mockFromNodeHeaders.mockReturnValue(new Headers());
    mockGetSession.mockResolvedValue(session);

    await requireSession(req, res, next);

    expect((req as AuthenticatedRequest).session).toEqual(session);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("passes headers to BetterAuth getSession", async () => {
    const req = { headers: { cookie: "session=abc" } } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;
    const headers = new Headers();

    mockFromNodeHeaders.mockReturnValue(headers);
    mockGetSession.mockResolvedValue({
      user: { id: "u1", name: "Alice", email: "a@b.com" },
      session: { id: "s1", userId: "u1", expiresAt: new Date() },
    });

    await requireSession(req, res, next);

    expect(mockFromNodeHeaders).toHaveBeenCalledWith(req.headers);
    expect(mockGetSession).toHaveBeenCalledWith({ headers });
  });
});
