import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import axios from "axios";
import type { CalendarDayData } from "@/lib/api/calendar";

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: new Proxy(actual.motion, {
      get: (_target, prop: string) => {
        const Tag = prop as keyof React.JSX.IntrinsicElements;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Comp = ({ children: c, ...rest }: any) => <Tag {...rest}>{c}</Tag>;
        Comp.displayName = `motion.${prop}`;
        return Comp;
      },
    }),
  };
});

const { mockUseUser, mockFetchCalendarWeek, mockAssignCalendarEntry, mockFetchMealPlanWeek } =
  vi.hoisted(() => ({
    mockUseUser: vi.fn(),
    mockFetchCalendarWeek: vi.fn(),
    mockAssignCalendarEntry: vi.fn(),
    mockFetchMealPlanWeek: vi.fn(),
  }));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@/context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("@/lib/api/calendar", () => ({
  fetchCalendarWeek: mockFetchCalendarWeek,
  assignCalendarEntry: mockAssignCalendarEntry,
  toSundayIso: vi.fn(() => "2026-04-12"),
}));

vi.mock("@/lib/api/meal-plan", () => ({
  fetchMealPlanWeek: mockFetchMealPlanWeek,
  toMondayIso: vi.fn(() => "2026-04-13"),
}));

import { CalendarDayView } from "@/components/ui/Dashboard/contents/calendar/CalendarDayView";
import toast from "react-hot-toast";

const mondayMeals: CalendarDayData = {
  breakfast: null,
  lunch: null,
  dinner: null,
};

describe("CalendarDayView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: "u1" } });
    mockAssignCalendarEntry.mockResolvedValue({});
    mockFetchMealPlanWeek.mockResolvedValue({
      days: {
        Monday: {
          breakfast: [
            {
              entryId: "entry-1",
              recipeId: "r1",
              title: "French Toast",
              description: "Custardy bread",
              imageUrl: "",
              cookingTime: 15,
              notes: "",
            },
            {
              entryId: "entry-2",
              recipeId: "r2",
              title: "Avocado Toast",
              description: "Crunchy toast",
              imageUrl: "",
              cookingTime: 10,
              notes: "",
            },
          ],
          lunch: [],
          dinner: [],
        },
      },
    });
    mockFetchCalendarWeek.mockResolvedValue({
      weekStartDate: "2026-04-12",
      days: {
        "2026-04-13": {
          breakfast: null,
          lunch: null,
          dinner: null,
        },
        "2026-04-14": {
          breakfast: {
            entryId: "calendar-1",
            recipeId: "r1",
            title: "French Toast",
            description: "Already assigned",
            imageUrl: "",
            cookingTime: 15,
            notes: "",
          },
          lunch: null,
          dinner: null,
        },
      },
    });
  });

  it("shows a weekly assignment badge on recipes already used this week", async () => {
    render(
      <CalendarDayView
        date={new Date("2026-04-13T12:00:00")}
        meals={mondayMeals}
        onBack={vi.fn()}
        onNewRecipe={vi.fn()}
        onMealsChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("French Toast")).toBeInTheDocument();
      expect(screen.getByText("Avocado Toast")).toBeInTheDocument();
    });

    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getAllByText("This Week")).toHaveLength(1);
  });

  it("shows the full backend duplicate message in a toast on 409", async () => {
    mockAssignCalendarEntry.mockRejectedValue(
      axios.AxiosError.from(
        new Error("Conflict"),
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        {
          status: 409,
          statusText: "Conflict",
          headers: {},
          config: {} as never,
          data: {
            message: "This meal was already assigned to this week.",
          },
        },
      ),
    );

    render(
      <CalendarDayView
        date={new Date("2026-04-13T12:00:00")}
        meals={mondayMeals}
        onBack={vi.fn()}
        onNewRecipe={vi.fn()}
        onMealsChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("French Toast")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /french toast/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "This meal was already assigned to this week.",
      );
    });
  });
});
