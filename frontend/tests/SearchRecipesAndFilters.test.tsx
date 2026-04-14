import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import SearchContainer from "@/components/features/dashboard/SearchModal";

type MockRecipe = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  cookingTime: number;
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  ingredients?: Array<{ foodItem: string }>;
};

const allRecipes: MockRecipe[] = [
  {
    id: "1",
    title: "Creamy Pasta Alfredo",
    description: "Rich pasta with sauce",
    cookingTime: 20,
    skillLevel: "beginner",
    ingredients: [{ foodItem: "pasta" }],
  },
  {
    id: "2",
    title: "Chicken Pasta Primavera",
    description: "Chicken and pasta",
    cookingTime: 35,
    skillLevel: "intermediate",
    ingredients: [{ foodItem: "chicken" }],
  },
  {
    id: "3",
    title: "Chicken Stir Fry",
    description: "Quick chicken dinner",
    cookingTime: 30,
    skillLevel: "intermediate",
    ingredients: [{ foodItem: "chicken" }],
  },
  {
    id: "4",
    title: "Beef Stew",
    description: "Slow-cooked meal",
    cookingTime: 90,
    skillLevel: "advanced",
    ingredients: [{ foodItem: "beef" }],
  },
];

let fetchMock: ReturnType<typeof vi.fn>;

function searchLocally(q: string) {
  const needle = q.toLowerCase();
  return allRecipes.filter((r) => {
    const haystack = `${r.title} ${r.description} ${(r.ingredients ?? [])
      .map((i) => i.foodItem)
      .join(" ")}`.toLowerCase();
    return haystack.includes(needle);
  });
}

describe("Search + Filters UI (US.05 / US.06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), "http://localhost");
        const q = url.searchParams.get("q");
        const recipes = q ? searchLocally(q) : allRecipes;

        return {
          ok: true,
          json: async () => ({
            data: {
              recipes,
            },
          }),
        } as Response;
      });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("supports keyword search, no results message, and clearing to full results", async () => {
    render(<SearchContainer onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Search for recipes/i);
    fireEvent.change(searchInput, { target: { value: "pasta" } });

    await waitFor(() => {
      expect(screen.getByText("Creamy Pasta Alfredo")).toBeInTheDocument();
      expect(screen.getByText("Chicken Pasta Primavera")).toBeInTheDocument();
      expect(screen.queryByText("Beef Stew")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.change(searchInput, { target: { value: "zzzz-no-match" } });
    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.change(searchInput, { target: { value: "" } });
    const suggestedButton = screen.getByRole("button", { name: "Suggested" });
    fireEvent.click(suggestedButton);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).startsWith("/api/recipes?"),
        ),
      ).toBe(true);
    }, { timeout: 3000 });
  });

  it("applies time + difficulty with AND logic when combined with search", async () => {
    render(<SearchContainer onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/Search for recipes/i), {
      target: { value: "chicken" },
    });

    await waitFor(() => {
      expect(screen.getByText("Chicken Pasta Primavera")).toBeInTheDocument();
      expect(screen.getByText("Chicken Stir Fry")).toBeInTheDocument();
    }, { timeout: 3000 });

    const paramsBar = document.querySelector(".search-params");
    expect(paramsBar).toBeTruthy();
    const buttons = paramsBar?.querySelectorAll("button");
    expect(buttons && buttons.length >= 2).toBe(true);
    fireEvent.click(buttons![1]);

    await waitFor(() => {
      expect(screen.getByText("Skill Level")).toBeInTheDocument();
      expect(screen.getByText("Cooking Time")).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByRole("button", { name: "Intermediate" }));
    fireEvent.click(screen.getByRole("button", { name: "15-30 mins" }));

    await waitFor(() => {
      expect(screen.getByText("Chicken Stir Fry")).toBeInTheDocument();
      expect(screen.queryByText("Chicken Pasta Primavera")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
