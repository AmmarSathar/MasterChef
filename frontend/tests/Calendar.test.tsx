import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

const { mockUseUser, mockToastLoading, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockUseUser: vi.fn(),
    mockToastLoading: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }));

// ── Mocks ──────────────────────────────────────────────────────

// Framer-motion stub
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

// Calendar API mock (must be hoisted above imports)
const { mockFetchCalendarWeek, mockAssignCalendarEntry, mockClearCalendarEntry, mockFetchMealPlanWeek } =
  vi.hoisted(() => ({
    mockFetchCalendarWeek: vi.fn(),
    mockAssignCalendarEntry: vi.fn(),
    mockClearCalendarEntry: vi.fn(),
    mockFetchMealPlanWeek: vi.fn(),
  }));

vi.mock("@/lib/api/calendar", () => ({
  fetchCalendarWeek: mockFetchCalendarWeek,
  assignCalendarEntry: mockAssignCalendarEntry,
  clearCalendarEntry: mockClearCalendarEntry,
  toSundayIso: vi.fn((d: Date) => d.toISOString().split("T")[0]),
  emptyCalendarDay: vi.fn(() => ({ breakfast: null, lunch: null, dinner: null })),
}));

vi.mock("@/lib/api/meal-plan", () => ({
  fetchMealPlanWeek: mockFetchMealPlanWeek,
  toMondayIso: vi.fn((d: Date) => d.toISOString().split("T")[0]),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    loading: mockToastLoading,
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("@/components/features/recipe/RecipeCreator", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="recipe-creator">
      <button onClick={onClose}>Close Creator</button>
    </div>
  ),
}));

vi.mock("@/components/features/recipe/RecipeView", () => ({
  default: ({
    recipe,
    onClose,
    onRemoveFromSlot,
  }: {
    recipe: { title: string };
    onClose: () => void;
    onRemoveFromSlot?: () => void;
  }) => (
    <div data-testid="recipe-view">
      <span>{recipe.title}</span>
      <button onClick={onClose}>Close Recipe View</button>
      {onRemoveFromSlot ? (
        <button onClick={onRemoveFromSlot}>Remove from slot</button>
      ) : null}
    </div>
  ),
}));

vi.mock("@/components/features/dashboard/contents/calendar/CalendarPicker", () => ({
  CalendarPicker: ({ onDaySelect }: { onDaySelect: (d: Date) => void }) => (
    <div data-testid="calendar-picker">
      <button onClick={() => onDaySelect(new Date("2026-05-04"))}>Pick May 4</button>
    </div>
  ),
}));

vi.mock(
  "@/components/features/dashboard/contents/calendar/CalendarDayView",
  async (importOriginal) => {
    return {
      CalendarDayView: ({ onBack }: { onBack: () => void }) => (
        <div data-testid="calendar-day-view">
          <button onClick={onBack}>Back</button>
        </div>
      ),
      MEAL_SLOTS: ["breakfast", "lunch", "dinner"],
    };
  }
);

// Stub CalendarSlotPicker so CalendarWeekView tests don't need useUser context
vi.mock("@/components/features/dashboard/contents/calendar/CalendarSlotPicker", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="calendar-slot-picker">
      <button onClick={onClose}>Close Picker</button>
    </div>
  ),
}));

import { CalendarContent } from "@/components/features/dashboard/contents/Calendar";

// ── Helpers ────────────────────────────────────────────────────

const emptyWeekData = () => ({
  weekStartDate: "2026-04-06",
  days: {} as Record<string, Record<string, null>>,
});

// ── CalendarContent ────────────────────────────────────────────

describe("CalendarContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCalendarWeek.mockResolvedValue(emptyWeekData());
    mockFetchMealPlanWeek.mockResolvedValue({ days: {} });
    mockClearCalendarEntry.mockResolvedValue(undefined);
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
      loading: false,
    });
  });

  it("renders the three time-filter tabs", () => {
    render(<CalendarContent />);
    expect(screen.getByText("weekly")).toBeInTheDocument();
    expect(screen.getByText("monthly")).toBeInTheDocument();
    expect(screen.getByText("yearly")).toBeInTheDocument();
  });

  it("shows the weekly view (7 day columns) by default", async () => {
    render(<CalendarContent />);
    await waitFor(() => {
      const dayCols = document.querySelectorAll(".day-col");
      expect(dayCols).toHaveLength(7);
    });
  });

  it("switching to monthly shows the period-grid", () => {
    render(<CalendarContent />);
    fireEvent.click(screen.getByText("monthly"));
    const periodGrid = document.querySelector(".period-grid");
    expect(periodGrid).toBeTruthy();
  });

  it("clicking yearly tab shows the period grid (grid-cols-4)", () => {
    render(<CalendarContent />);
    fireEvent.click(screen.getByText("yearly"));
    const periodGrid = document.querySelector(".period-grid.grid-cols-4");
    expect(periodGrid).toBeTruthy();
  });

  it("clicking a day column in weekly view transitions to day view", async () => {
    render(<CalendarContent />);
    await waitFor(() => expect(document.querySelectorAll(".day-col.cursor-pointer").length).toBe(7));

    const firstDayCol = document.querySelector(".day-col.cursor-pointer") as HTMLElement;
    fireEvent.click(firstDayCol!);

    expect(screen.getByTestId("calendar-day-view")).toBeInTheDocument();
  });

it("Back button in day view returns to calendar view", async () => {
  render(<CalendarContent />);
  await waitFor(() => expect(document.querySelectorAll(".day-col.cursor-pointer").length).toBe(7));

  const firstDayCol = document.querySelector(".day-col.cursor-pointer") as HTMLElement;
  fireEvent.click(firstDayCol!);
  expect(screen.getByTestId("calendar-day-view")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /back/i }));
  
  // Wait for the day view to disappear first
  await waitFor(() => expect(screen.queryByTestId("calendar-day-view")).not.toBeInTheDocument());
  
  // Then verify the week view is back
  await waitFor(() => expect(document.querySelectorAll(".day-col")).toHaveLength(7));
});

  it("CalendarPicker day pick switches active filter back to weekly", () => {
    render(<CalendarContent />);

    fireEvent.click(screen.getByText("yearly"));
    const yearlyBtn = screen.getByText("yearly");
    expect(yearlyBtn.className).toContain("bg-secondary");

    fireEvent.click(screen.getByRole("button", { name: /pick may 4/i }));

    const weeklyBtn = screen.getByText("weekly");
    expect(weeklyBtn.className).toContain("bg-secondary");
  });

  it("Export Weekly Plan button opens RecipeCreator", async () => {
    render(<CalendarContent />);
    fireEvent.click(screen.getByRole("button", { name: /export weekly plan/i }));
    expect(screen.getByTestId("recipe-creator")).toBeInTheDocument();
  });

  it("Closing the creator hides it", async () => {
    render(<CalendarContent />);
    fireEvent.click(screen.getByRole("button", { name: /export weekly plan/i }));
    expect(screen.getByTestId("recipe-creator")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close creator/i }));
    expect(screen.queryByTestId("recipe-creator")).not.toBeInTheDocument();
  });

  it("shows Remove from slot only in the calendar recipe popup and clears the selected slot", async () => {
    const weekStart = new Date(2026, 3, 12);
    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
    const dateKey = weekDates[0];
    const weekDays = Object.fromEntries(
      weekDates.map((key, index) => [
        key,
        {
          breakfast:
            index === 0
              ? {
                  entryId: "entry-1",
                  recipeId: "recipe-1",
                  title: "Egg Toast",
                  description: "Breakfast toast",
                  imageUrl: "https://example.com/egg-toast.jpg",
                  cookingTime: 10,
                  notes: "",
                }
              : null,
          lunch: null,
          dinner: null,
        },
      ]),
    );

    mockFetchCalendarWeek.mockResolvedValue({
      weekStartDate: dateKey,
      days: weekDays,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ({
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: "u1",
              title: "Egg Toast",
              description: "Breakfast toast",
              prepingTime: 5,
              cookingTime: 10,
              servings: 1,
              skillLevel: "beginner",
              dietaryTags: [],
              containsAllergens: [],
              ingredients: [],
              steps: [],
            },
          }),
        }) as Response,
      ),
    );

    render(<CalendarContent />);

    await waitFor(() => {
      expect(screen.getByText("Egg Toast")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Egg Toast"));

    await waitFor(() => {
      expect(screen.getByTestId("recipe-view")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /remove from slot/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /remove from slot/i }));

    await waitFor(() => {
      expect(mockClearCalendarEntry).toHaveBeenCalledWith(dateKey, "breakfast");
      expect(screen.queryByText("Egg Toast")).not.toBeInTheDocument();
    });
  });
});

// ── CalendarWeekView ───────────────────────────────────────────
// Use vi.importActual to bypass the (non-existent) module mock and test
// the real CalendarWeekView component directly.

import type { CalendarDayData, CalendarSlotEntry } from "@/lib/api/calendar";
import type { ComponentType } from "react";

type WeekViewProps = {
  dates: Date[];
  selectionsByDay: Record<string, CalendarDayData>;
  onDayClick: (date: Date) => void;
};

describe("CalendarWeekView", () => {
  let CalendarWeekView: ComponentType<WeekViewProps>;

  const SUNDAY = new Date("2026-04-06"); // local Sunday (UTC: 2026-04-05 midnight)
  function makeWeekDates(start: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  beforeAll(async () => {
    const mod = await vi.importActual<{ default: ComponentType<WeekViewProps> }>(
      "@/components/features/dashboard/contents/calendar/CalendarWeekView"
    );
    CalendarWeekView = mod.default;
  });

  const onDayClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 7 day columns", () => {
    const dates = makeWeekDates(SUNDAY);
    render(
      <CalendarWeekView dates={dates} selectionsByDay={{}} onDayClick={onDayClick} />
    );
    const dayCols = document.querySelectorAll(".day-col");
    expect(dayCols).toHaveLength(7);
  });

  it("renders the date number for each day", () => {
    const dates = makeWeekDates(SUNDAY);
    render(
      <CalendarWeekView dates={dates} selectionsByDay={{}} onDayClick={onDayClick} />
    );
    dates.forEach((d) => {
      expect(screen.getByText(d.getDate().toString())).toBeInTheDocument();
    });
  });

  it("calls onDayClick when a column is clicked", () => {
    const dates = makeWeekDates(SUNDAY);
    render(
      <CalendarWeekView dates={dates} selectionsByDay={{}} onDayClick={onDayClick} />
    );

    const firstDayCol = document.querySelector(".day-col") as HTMLElement;
    fireEvent.click(firstDayCol!);

    expect(onDayClick).toHaveBeenCalledWith(dates[0]);
  });

  it("renders empty slot placeholders for days with no meals", () => {
    const dates = makeWeekDates(SUNDAY);
    render(
      <CalendarWeekView dates={dates} selectionsByDay={{}} onDayClick={onDayClick} />
    );

    const emptySlots = document.querySelectorAll(".meal-slot-empty");
    expect(emptySlots.length).toBe(7 * 3); // 3 slots per day
  });

  it("renders a meal card with image and title when a slot is filled", () => {
    const dates = makeWeekDates(SUNDAY);
    const dateKey = `${dates[0].getFullYear()}-${String(dates[0].getMonth() + 1).padStart(2, "0")}-${String(dates[0].getDate()).padStart(2, "0")}`;

    const meal: CalendarSlotEntry = {
      entryId: "e1",
      recipeId: "r1",
      title: "Eggs Benedict",
      description: "Classic brunch",
      imageUrl: "https://example.com/img.jpg",
      cookingTime: 15,
      notes: "",
    };

    const days: Record<string, CalendarDayData> = {
      [dateKey]: { breakfast: meal, lunch: null, dinner: null },
    };

    render(
      <CalendarWeekView dates={dates} selectionsByDay={days} onDayClick={onDayClick} />
    );

    expect(screen.getByText("Eggs Benedict")).toBeInTheDocument();
    expect(screen.getByAltText("Eggs Benedict")).toBeInTheDocument();
  });

  it("shows the slot label on filled meal cards", () => {
    const dates = makeWeekDates(SUNDAY);
    const dateKey = `${dates[1].getFullYear()}-${String(dates[1].getMonth() + 1).padStart(2, "0")}-${String(dates[1].getDate()).padStart(2, "0")}`;

    const meal: CalendarSlotEntry = {
      entryId: "e2",
      recipeId: "r2",
      title: "Grilled Chicken",
      description: "",
      imageUrl: "",
      cookingTime: 20,
      notes: "",
    };

    render(
      <CalendarWeekView
        dates={dates}
        selectionsByDay={{ [dateKey]: { breakfast: null, lunch: meal, dinner: null } }}
        onDayClick={onDayClick}
      />
    );

    expect(screen.getByText("lunch")).toBeInTheDocument();
    expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
  });
});
