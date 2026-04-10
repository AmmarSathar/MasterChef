import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────

const { mockUseUser, mockAddMealPlanEntry } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockAddMealPlanEntry: vi.fn(),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("@/lib/api/meal-plan", () => ({
  addMealPlanEntry: mockAddMealPlanEntry,
}));

// Stub axios so the component's direct axios.get call is intercepted
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";
import MealPickerPanel from "@/components/ui/Dashboard/contents/MealPickerPanel";
import type { MealEntry } from "@/lib/api/meal-plan";

// ── Helpers ────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  slot: "breakfast" as const,
  dayName: "Monday" as const,
  mealPlanId: "plan-1",
  onSelect: vi.fn(),
  onClose: vi.fn(),
};

function makeRecipe(id: string, title: string) {
  return {
    id,
    title,
    description: "A recipe",
    imageUrl: "",
    prepingTime: 5,
    cookingTime: 10,
    servings: 2,
    skillLevel: "beginner",
    dietaryTags: [],
    ingredients: [],
    steps: [],
    createdBy: "u1",
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mockAxiosGet(recipes: ReturnType<typeof makeRecipe>[], totalPages = 1) {
  vi.mocked(axios.get).mockResolvedValue({
    data: { data: { recipes, totalPages } },
  });
}

// ── Tests ──────────────────────────────────────────────────────

describe("MealPickerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: "u1" } });
  });

  it("renders the panel title and page indicator", async () => {
    mockAxiosGet([]);

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    expect(screen.getByText("Recipes")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("1 / 1")).toBeInTheDocument();
    });
  });

  it("shows a loading state while fetching recipes", () => {
    // Never resolve
    vi.mocked(axios.get).mockReturnValue(new Promise(() => {}));

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty state when the user has no recipes", async () => {
    mockAxiosGet([]);

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument();
    });
  });

  it("renders recipe cards after a successful fetch", async () => {
    mockAxiosGet([
      makeRecipe("r1", "Omelette"),
      makeRecipe("r2", "Pancakes"),
    ]);

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(screen.getByText("Omelette")).toBeInTheDocument();
      expect(screen.getByText("Pancakes")).toBeInTheDocument();
    });
  });

  it("calls addMealPlanEntry and onSelect when a recipe card is clicked", async () => {
    const recipe = makeRecipe("r1", "French Toast");
    mockAxiosGet([recipe]);
    mockAddMealPlanEntry.mockResolvedValue({ entryId: "entry-1" });

    const onSelect = vi.fn();
    render(<MealPickerPanel {...DEFAULT_PROPS} onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("French Toast")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("French Toast"));

    await waitFor(() => {
      expect(mockAddMealPlanEntry).toHaveBeenCalledWith("plan-1", {
        dayOfWeek: "Monday",
        mealType: "breakfast",
        recipeId: "r1",
      });
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          entryId: "entry-1",
          recipeId: "r1",
          title: "French Toast",
        })
      );
    });
  });

  it("does not call onSelect while a submission is in-flight (debounce guard)", async () => {
    const recipe = makeRecipe("r1", "Waffles");
    mockAxiosGet([recipe]);

    let resolveAdd!: (v: { entryId: string }) => void;
    mockAddMealPlanEntry.mockReturnValue(new Promise((r) => { resolveAdd = r; }));

    const onSelect = vi.fn();
    render(<MealPickerPanel {...DEFAULT_PROPS} onSelect={onSelect} />);

    await waitFor(() => screen.getByText("Waffles"));

    const card = screen.getByText("Waffles");
    fireEvent.click(card);
    fireEvent.click(card); // second click while in-flight

    resolveAdd({ entryId: "e1" });
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
  });

  it("shows previous-page button disabled on page 1 and next-page disabled on last page", async () => {
    mockAxiosGet([makeRecipe("r1", "Solo Recipe")], 1);

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    await waitFor(() => screen.getByText("Solo Recipe"));

    const buttons = screen.getAllByRole("button");
    // Find the chevron nav buttons (last two rendered inside pagination)
    const prevBtn = buttons.find((b) => b.querySelector("svg") && b.getAttribute("disabled") !== null);
    expect(prevBtn).toBeDefined();
  });

  it("advances page and fetches new recipes on ChevronRight click", async () => {
    // First page
    mockAxiosGet(
      [makeRecipe("r1", "Page 1 Recipe")],
      2
    );

    render(<MealPickerPanel {...DEFAULT_PROPS} />);

    await waitFor(() => screen.getByText("Page 1 Recipe"));

    // Set up second page response
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: { recipes: [makeRecipe("r2", "Page 2 Recipe")], totalPages: 2 } },
    });

    // All buttons — find ChevronRight (next page button is the last chevron)
    const allButtons = screen.getAllByRole("button");
    const nextBtn = allButtons[allButtons.length - 1]; // last button is ChevronRight
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("Page 2 Recipe")).toBeInTheDocument();
    });
  });

  it("calls onClose when the backdrop is clicked", async () => {
    mockAxiosGet([]);

    const onClose = vi.fn();
    render(<MealPickerPanel {...DEFAULT_PROPS} onClose={onClose} />);

    await waitFor(() => screen.getByText("Recipes"));

    // The backdrop is the first motion.div (z-40, fixed, inset-0)
    const backdrop = document.querySelector(".fixed.inset-0.z-40");
    fireEvent.click(backdrop!);

    expect(onClose).toHaveBeenCalled();
  });
});
