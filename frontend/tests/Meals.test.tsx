import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";

// ── Framer-motion stub ─────────────────────────────────────────
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// ── API mocks ──────────────────────────────────────────────────

const {
  mockFetchMealPlanWeek,
  mockAddMealPlanEntry,
  mockRemoveMealPlanEntry,
  mockToMondayIso,
} = vi.hoisted(() => ({
  mockFetchMealPlanWeek: vi.fn(),
  mockAddMealPlanEntry: vi.fn(),
  mockRemoveMealPlanEntry: vi.fn(),
  mockToMondayIso: vi.fn((d: Date) => d.toISOString().split("T")[0]),
}));

vi.mock("@/lib/api/meal-plan", () => ({
  fetchMealPlanWeek: mockFetchMealPlanWeek,
  addMealPlanEntry: mockAddMealPlanEntry,
  removeMealPlanEntry: mockRemoveMealPlanEntry,
  toMondayIso: mockToMondayIso,
}));

// Stub MealPickerPanel
vi.mock("@/components/ui/Dashboard/contents/MealPickerPanel", () => ({
  default: (props: {
    slot: string;
    dayName: string;
    mealPlanId: string;
    onSelect: (entry: unknown) => void;
    onClose: () => void;
  }) => (
    <div data-testid="meal-picker-panel">
      <span data-testid="picker-slot">{props.slot}</span>
      <button
        onClick={() =>
          props.onSelect({
            entryId: "new-e1",
            recipeId: "r-new",
            title: "Picked Recipe",
            description: "",
            imageUrl: "",
            cookingTime: 10,
            notes: "",
          })
        }
      >
        Pick Recipe
      </button>
      <button onClick={props.onClose}>Close Panel</button>
    </div>
  ),
}));

import { MealsContent } from "@/components/ui/Dashboard/contents/Meals";
import type { WeekDays } from "@/lib/api/meal-plan";

// ── Helpers ────────────────────────────────────────────────────

function emptyWeekDays(): WeekDays {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  const slots = ["breakfast", "lunch", "dinner"] as const;
  const result = {} as WeekDays;
  for (const day of days) {
    result[day] = {} as WeekDays[typeof day];
    for (const slot of slots) {
      result[day][slot] = [];
    }
  }
  return result;
}

function weekWithEntry(): WeekDays {
  const days = emptyWeekDays();
  const entry = {
    entryId: "e1",
    recipeId: "r1",
    title: "Scrambled Eggs",
    description: "Classic eggs",
    imageUrl: "",
    cookingTime: 5,
    notes: "",
  };
  // Add the entry to every day so it always shows regardless of activeDay
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  for (const day of dayNames) {
    days[day]["breakfast"] = [entry];
  }
  return days;
}

const fakePlan = (days: WeekDays) => ({ id: "plan-1", weekStartDate: new Date(), days });

// ── Tests ──────────────────────────────────────────────────────

describe("MealsContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchMealPlanWeek.mockResolvedValue(fakePlan(emptyWeekDays()));
  });

  // ── Loading state ────────────────────────────────────────────

  it("shows loading state while fetching", () => {
    mockFetchMealPlanWeek.mockReturnValue(new Promise(() => {}));

    render(<MealsContent />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("hides loading state after fetch resolves", async () => {
    render(<MealsContent />);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });
  });

  // ── Week header ──────────────────────────────────────────────

  it("renders 7 day buttons in the week header", async () => {
    render(<MealsContent />);

    await waitFor(() => expect(screen.queryByText("Loading…")).toBeNull());

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const label of dayLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows 'Week of' label in the header", async () => {
    render(<MealsContent />);

    await waitFor(() => expect(screen.getByText(/week of/i)).toBeInTheDocument());
  });

  // ── Week navigation ──────────────────────────────────────────

  it("navigates to previous/next week and re-fetches", async () => {
    render(<MealsContent />);

    await waitFor(() => expect(screen.queryByText("Loading…")).toBeNull());

    // Find the two navigation chevron buttons in the header
    const roundButtons = screen.getAllByRole("button").filter(
      (b) => b.className.includes("rounded-full") && b.querySelector("svg")
    );

    // Click prev
    fireEvent.click(roundButtons[0]);
    await waitFor(() => expect(mockFetchMealPlanWeek).toHaveBeenCalledTimes(2));

    // Click next (twice to go back and forward)
    fireEvent.click(roundButtons[1]);
    await waitFor(() => expect(mockFetchMealPlanWeek).toHaveBeenCalledTimes(3));
  });

  // ── Meal slots ───────────────────────────────────────────────

  it("renders Breakfast, Lunch, and Dinner slot labels", async () => {
    render(<MealsContent />);

    await waitFor(() => {
      expect(screen.getByText("Breakfast")).toBeInTheDocument();
      expect(screen.getByText("Lunch")).toBeInTheDocument();
      expect(screen.getByText("Dinner")).toBeInTheDocument();
    });
  });

  it("renders MealCards for entries returned by the API", async () => {
    mockFetchMealPlanWeek.mockResolvedValue(fakePlan(weekWithEntry()));

    render(<MealsContent />);

    await waitFor(() => {
      expect(screen.getByText("Scrambled Eggs")).toBeInTheDocument();
    });
  });

  it("renders at least one AddMealCard per slot", async () => {
    render(<MealsContent />);

    await waitFor(() => {
      expect(screen.getAllByText("Add item").length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── Picker interaction ───────────────────────────────────────

  it("opens MealPickerPanel when AddMealCard is clicked", async () => {
    render(<MealsContent />);

    await waitFor(() => screen.queryByText("Loading…") === null);

    const addButtons = screen.getAllByText("Add item");
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId("meal-picker-panel")).toBeInTheDocument();
  });

  it("passes the correct slot to the picker", async () => {
    render(<MealsContent />);

    await waitFor(() => screen.queryByText("Loading…") === null);

    const addButtons = screen.getAllByText("Add item");
    fireEvent.click(addButtons[0]); // breakfast AddMealCard

    expect(screen.getByTestId("picker-slot").textContent).toBe("breakfast");
  });

  it("adds a new entry and closes the picker when recipe is selected", async () => {
    render(<MealsContent />);

    await waitFor(() => screen.queryByText("Loading…") === null);

    fireEvent.click(screen.getAllByText("Add item")[0]);
    expect(screen.getByTestId("meal-picker-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Pick Recipe"));

    await waitFor(() => {
      expect(screen.queryByTestId("meal-picker-panel")).not.toBeInTheDocument();
      expect(screen.getByText("Picked Recipe")).toBeInTheDocument();
    });
  });

  it("closes the picker without adding when onClose is triggered", async () => {
    render(<MealsContent />);

    await waitFor(() => screen.queryByText("Loading…") === null);

    fireEvent.click(screen.getAllByText("Add item")[0]);
    expect(screen.getByTestId("meal-picker-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Panel"));

    await waitFor(() => {
      expect(screen.queryByTestId("meal-picker-panel")).not.toBeInTheDocument();
    });
  });

  // ── Context menu + Remove ────────────────────────────────────

  it("clicking MoreHorizontal button reveals a Remove option", async () => {
    mockFetchMealPlanWeek.mockResolvedValue(fakePlan(weekWithEntry()));

    render(<MealsContent />);

    await waitFor(() => screen.getByText("Scrambled Eggs"));

    // The context-menu button has no text label — find it by its position
    // relative to the card. It is the button with h-8 w-8 rounded-full inside
    // the MealCard.
    const moreBtn = document.querySelector(".absolute.top-4.right-4 button") as HTMLElement;
    fireEvent.click(moreBtn!);

    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("Remove menu item removes the entry from the UI immediately", async () => {
    mockFetchMealPlanWeek.mockResolvedValue(fakePlan(weekWithEntry()));

    render(<MealsContent />);

    await waitFor(() => screen.getByText("Scrambled Eggs"));

    const moreBtn = document.querySelector(".absolute.top-4.right-4 button") as HTMLElement;
    fireEvent.click(moreBtn!);
    fireEvent.click(screen.getByText("Remove"));

    await waitFor(() => {
      expect(screen.queryByText("Scrambled Eggs")).not.toBeInTheDocument();
    });
  });

  // ── 5-second debounce sync ───────────────────────────────────

  describe("5s debounce sync (fake timers)", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("does NOT call the sync API before 5 seconds", async () => {
      vi.useFakeTimers();
      mockFetchMealPlanWeek.mockResolvedValue(fakePlan(weekWithEntry()));

      render(<MealsContent />);

      // Let the initial fetch resolve inside fake-timer world
      await act(async () => {
        await Promise.resolve(); // flush microtasks
        vi.runAllMicrotasks?.();
      });

      // Perform a remove
      const moreBtn = document.querySelector(".absolute.top-4.right-4 button") as HTMLElement;
      if (moreBtn) {
        fireEvent.click(moreBtn);
        const removeBtn = screen.queryByText("Remove");
        if (removeBtn) fireEvent.click(removeBtn);
      }

      // 4 seconds pass — no sync yet
      act(() => vi.advanceTimersByTime(4000));

      expect(mockRemoveMealPlanEntry).not.toHaveBeenCalled();
    });

    it("calls the sync API after 5 seconds", async () => {
      vi.useFakeTimers();

      // Only put entry on MONDAY so removing it makes it disappear from all state
      const mondayOnlyDays = emptyWeekDays();
      mondayOnlyDays["Monday"]["breakfast"] = [{
        entryId: "e1",
        recipeId: "r1",
        title: "Sync Test Egg",
        description: "",
        imageUrl: "",
        cookingTime: 5,
        notes: "",
      }];
      mockFetchMealPlanWeek.mockResolvedValue(fakePlan(mondayOnlyDays));
      mockRemoveMealPlanEntry.mockResolvedValue(undefined);

      await act(async () => {
        render(<MealsContent />);
        await vi.advanceTimersByTimeAsync(0);
      });

      // Activate Monday's view
      await act(async () => {
        fireEvent.click(screen.getByText("Mon"));
      });

      // Verify the entry is visible
      const moreBtn = document.querySelector(".absolute.top-4.right-4 button") as HTMLElement;
      expect(moreBtn).toBeTruthy();

      // Remove it
      await act(async () => {
        fireEvent.click(moreBtn);
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Remove"));
      });

      // Advance past 5s
      mockFetchMealPlanWeek.mockResolvedValue(fakePlan(emptyWeekDays()));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5500);
      });

      expect(mockRemoveMealPlanEntry).toHaveBeenCalledWith("e1");
    });
  });
});
