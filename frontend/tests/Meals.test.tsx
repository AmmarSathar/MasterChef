import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MealsContent } from "@/components/ui/Dashboard/contents/Meals";

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock("@context/UserContext", () => ({
  useUser: () => ({
    user: { id: "user-1" },
    loading: false,
    logout: vi.fn(),
    setUser: vi.fn(),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: toastErrorMock,
  },
}));

function createEmptyMealPlan() {
  return {
    id: "plan-1",
    weekStartDate: "2026-03-23T00:00:00.000Z",
    days: {
      Monday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Tuesday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Wednesday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Thursday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Friday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Saturday: { breakfast: null, lunch: null, dinner: null, snack: null },
      Sunday: { breakfast: null, lunch: null, dinner: null, snack: null },
    },
  };
}

describe("MealsContent", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("assigns a recipe from the picker and updates the grid cell", async () => {
    const mealPlan = createEmptyMealPlan();

    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.startsWith("/api/recipes?")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              recipes: [
                {
                  id: "recipe-1",
                  title: "Pasta Primavera",
                  description: "Fresh vegetables and lemon butter sauce",
                },
              ],
            },
          }),
          { status: 200 }
        );
      }

      if (url.startsWith("/api/meal-plans?")) {
        return new Response(
          JSON.stringify({ success: true, data: mealPlan }),
          { status: 200 }
        );
      }

      if (url === "/api/meal-plans/plan-1/entries" && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: "entry-1", recipeId: "recipe-1", notes: "" },
          }),
          { status: 201 }
        );
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });

    render(<MealsContent />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const targetCell = screen.getAllByRole("button", { name: /add recipe/i })[0];
    fireEvent.click(targetCell);

    const option = await screen.findByRole("button", { name: /pasta primavera/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/meal-plans/plan-1/entries",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Pasta Primavera").length).toBeGreaterThan(0);
    });

    expect(screen.queryByPlaceholderText("Search your recipes")).not.toBeInTheDocument();
  });

  it("shows the duplicate message when the assign API returns 409", async () => {
    const mealPlan = createEmptyMealPlan();

    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.startsWith("/api/recipes?")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              recipes: [
                {
                  id: "recipe-2",
                  title: "Overnight Oats",
                  description: "Blueberries, chia, and yogurt",
                },
              ],
            },
          }),
          { status: 200 }
        );
      }

      if (url.startsWith("/api/meal-plans?")) {
        return new Response(
          JSON.stringify({ success: true, data: mealPlan }),
          { status: 200 }
        );
      }

      if (url === "/api/meal-plans/plan-1/entries" && method === "POST") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "A recipe is already assigned to this slot",
          }),
          { status: 409 }
        );
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });

    render(<MealsContent />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /add recipe/i })[0]);
    fireEvent.click(await screen.findByRole("button", { name: /overnight oats/i }));

    const alert = await screen.findByText("A recipe is already assigned to this slot");
    expect(alert).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search your recipes")).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("A recipe is already assigned to this slot");
  });

  it("marks recipes that are already assigned elsewhere in the week", async () => {
    const mealPlan = createEmptyMealPlan();
    mealPlan.days.Tuesday.dinner = {
      entryId: "entry-22",
      recipeId: "recipe-3",
      title: "Sheet Pan Gnocchi",
      notes: "",
    };

    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/recipes?")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              recipes: [
                {
                  id: "recipe-3",
                  title: "Sheet Pan Gnocchi",
                  description: "Tomatoes, basil, and crispy edges",
                },
                {
                  id: "recipe-4",
                  title: "Miso Salmon",
                  description: "Broiled salmon with rice",
                },
              ],
            },
          }),
          { status: 200 }
        );
      }

      if (url.startsWith("/api/meal-plans?")) {
        return new Response(
          JSON.stringify({ success: true, data: mealPlan }),
          { status: 200 }
        );
      }

      throw new Error(`Unexpected request: GET ${url}`);
    });

    render(<MealsContent />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /add recipe/i })[0]);

    const usedBadge = await screen.findByText("Used this week");
    expect(usedBadge).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /sheet pan gnocchi/i }).length).toBeGreaterThan(1);
  });
});
