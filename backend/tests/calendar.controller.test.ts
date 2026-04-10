import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ── Mock service before importing controller ───────────────────

const { mockGetCalendarWeek, mockUpsertCalendarEntry, mockRemoveCalendarEntry } = vi.hoisted(() => ({
  mockGetCalendarWeek: vi.fn(),
  mockUpsertCalendarEntry: vi.fn(),
  mockRemoveCalendarEntry: vi.fn(),
}));

vi.mock("../src/services/calendar.service.js", () => ({
  getCalendarWeek: mockGetCalendarWeek,
  upsertCalendarEntry: mockUpsertCalendarEntry,
  removeCalendarEntry: mockRemoveCalendarEntry,
}));

import {
  getCalendarWeek,
  upsertCalendarEntry,
  removeCalendarEntry,
} from "../src/controllers/calendar.controller.js";

// ── Helpers ────────────────────────────────────────────────────

const USER_ID = "507f1f77bcf86cd799439011";

function mockReq(overrides: Partial<Record<string, unknown>> = {}): Request {
  return {
    params: {},
    body: {},
    session: { user: { id: USER_ID } },
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response & { statusCode: number; json: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> } {
  const res = {
    statusCode: 200,
    json: vi.fn(),
    send: vi.fn(),
    status: vi.fn(),
  } as unknown as Response & { statusCode: number; json: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> };
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

const mockNext: NextFunction = vi.fn();

// ── Tests ──────────────────────────────────────────────────────

describe("Calendar controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getCalendarWeek ──────────────────────────────────────────

  describe("getCalendarWeek", () => {
    it("calls service with userId and date param, returns 200 with data", async () => {
      const fakeWeek = { weekStartDate: "2026-04-06", days: {} };
      mockGetCalendarWeek.mockResolvedValue(fakeWeek);

      const req = mockReq({ params: { date: "2026-04-06" } });
      const res = mockRes();

      await getCalendarWeek(req, res, mockNext);

      expect(mockGetCalendarWeek).toHaveBeenCalledWith(USER_ID, "2026-04-06");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeWeek });
    });

    it("forwards service errors to next()", async () => {
      const error = Object.assign(new Error("week must be Sunday"), { statusCode: 400 });
      mockGetCalendarWeek.mockRejectedValue(error);

      const req = mockReq({ params: { date: "2026-04-07" } });
      const res = mockRes();

      await getCalendarWeek(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ── upsertCalendarEntry ──────────────────────────────────────

  describe("upsertCalendarEntry", () => {
    it("calls service with correct args and returns 200", async () => {
      const fakeSlot = { entryId: "e1", recipeId: "r1", title: "Omelette", description: "", imageUrl: "", cookingTime: 10, notes: "" };
      mockUpsertCalendarEntry.mockResolvedValue(fakeSlot);

      const req = mockReq({
        params: { date: "2026-04-07", mealType: "breakfast" },
        body: { recipe_id: "r1", notes: "tasty" },
      });
      const res = mockRes();

      await upsertCalendarEntry(req, res, mockNext);

      expect(mockUpsertCalendarEntry).toHaveBeenCalledWith({
        userId: USER_ID,
        dateStr: "2026-04-07",
        mealType: "breakfast",
        recipeId: "r1",
        notes: "tasty",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeSlot });
    });

    it("returns 400 when recipe_id is missing in body", async () => {
      const req = mockReq({
        params: { date: "2026-04-07", mealType: "breakfast" },
        body: {},
      });
      const res = mockRes();

      await upsertCalendarEntry(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: "recipe_id is required" })
      );
      expect(mockUpsertCalendarEntry).not.toHaveBeenCalled();
    });

    it("forwards service errors to next()", async () => {
      const error = Object.assign(new Error("Recipe not found"), { statusCode: 404 });
      mockUpsertCalendarEntry.mockRejectedValue(error);

      const req = mockReq({
        params: { date: "2026-04-07", mealType: "lunch" },
        body: { recipe_id: "missing-id" },
      });
      const res = mockRes();

      await upsertCalendarEntry(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ── removeCalendarEntry ──────────────────────────────────────

  describe("removeCalendarEntry", () => {
    it("calls service and returns 204", async () => {
      mockRemoveCalendarEntry.mockResolvedValue(undefined);

      const req = mockReq({ params: { date: "2026-04-08", mealType: "dinner" } });
      const res = mockRes();

      await removeCalendarEntry(req, res, mockNext);

      expect(mockRemoveCalendarEntry).toHaveBeenCalledWith({
        userId: USER_ID,
        dateStr: "2026-04-08",
        mealType: "dinner",
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("forwards service errors to next()", async () => {
      const error = Object.assign(new Error("Calendar entry not found"), { statusCode: 404 });
      mockRemoveCalendarEntry.mockRejectedValue(error);

      const req = mockReq({ params: { date: "2026-04-08", mealType: "lunch" } });
      const res = mockRes();

      await removeCalendarEntry(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
