import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockUseUser, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("@/components/ui/RecipeContainer", () => ({
  RecipeContainer: ({
    recipes,
    onEdit,
    onDelete,
  }: {
    recipes: Array<{ id: string; title: string }>;
    onEdit: (recipe: { id: string; title: string }) => void;
    onDelete: (id: string) => void;
  }) => (
    <div>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <span>{recipe.title}</span>
          <button onClick={() => onEdit(recipe)}>Edit {recipe.title}</button>
          <button onClick={() => onDelete(recipe.id)}>Delete {recipe.title}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/RecipeCreator", () => ({
  default: ({
    initialData,
    onFinish,
  }: {
    initialData?: Record<string, unknown> | null;
    onFinish: (data: Record<string, unknown>) => void;
  }) => (
    <div data-testid="recipe-creator">
      {initialData ? (
        <button
          onClick={() =>
            onFinish({
              ...initialData,
              title: "Authentic Spaghetti Carbonara",
            })
          }
        >
          Save Mock Recipe
        </button>
      ) : (
        <button
          onClick={() =>
            onFinish({
              id: "temp-id",
              createdBy: "u1",
              createdAt: new Date(),
              updatedAt: new Date(),
              title: "Spaghetti Carbonara",
              description: "Classic Italian pasta dish",
              prepingTime: 10,
              cookingTime: 15,
              servings: 2,
              skillLevel: "intermediate",
              dietaryTags: [],
              ingredients: [
                { foodItem: "Spaghetti", amount: 200, unit: "g" },
                { foodItem: "Pancetta", amount: 100, unit: "g" },
                { foodItem: "Eggs", amount: 2, unit: "unit" },
                { foodItem: "Parmesan", amount: 50, unit: "g" },
              ],
              steps: [
                "Boil pasta",
                "Cook pancetta",
                "Mix eggs and cheese",
                "Combine all",
              ],
            })
          }
        >
          Create Mock Recipe
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/ui/RecipeView", () => ({
  default: ({
    recipe,
    onDelete,
  }: {
    recipe: { id: string; title: string };
    onDelete: (id: string) => void;
  }) => (
    <div data-testid="recipe-view">
      <span>{recipe.title}</span>
      <button onClick={() => onDelete(recipe.id)}>Delete from View</button>
    </div>
  ),
}));

import { RecipeContent } from "@/components/ui/Dashboard/contents/RecipeForm";

describe("Recipe CRUD flow (US.04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
    });
  });

  it("creates, edits, and deletes a recipe from the collection with owner payloads", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/recipes?") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              recipes: [
                {
                  id: "seed-1",
                  createdBy: { _id: "u1", name: "Owner" },
                  title: "Seed Recipe",
                  description: "seed",
                  prepingTime: 5,
                  cookingTime: 5,
                  servings: 1,
                  skillLevel: "beginner",
                  dietaryTags: [],
                  ingredients: [{ foodItem: "Water", amount: 1, unit: "cup" }],
                  steps: ["Serve"],
                },
              ],
            },
          }),
        } as Response;
      }

      if (url.endsWith("/api/recipes") && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: { _id: "u1", name: "Owner" },
              title: "Spaghetti Carbonara",
              description: "Classic Italian pasta dish",
              prepingTime: 10,
              cookingTime: 15,
              servings: 2,
              skillLevel: "intermediate",
              dietaryTags: [],
              ingredients: [{ foodItem: "Spaghetti", amount: 200, unit: "g" }],
              steps: ["Boil pasta"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      if (url.includes("/api/recipes/recipe-1") && method === "PUT") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: { _id: "u1", name: "Owner" },
              title: "Authentic Spaghetti Carbonara",
              description: "Classic Italian pasta dish",
              prepingTime: 10,
              cookingTime: 15,
              servings: 2,
              skillLevel: "intermediate",
              dietaryTags: [],
              ingredients: [{ foodItem: "Spaghetti", amount: 200, unit: "g" }],
              steps: ["Boil pasta"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      if (url.includes("/api/recipes/recipe-1") && method === "DELETE") {
        return {
          ok: true,
          json: async () => ({ message: "Recipe deleted" }),
        } as Response;
      }

      return {
        ok: false,
        json: async () => ({ message: "Unexpected request" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeContent />);

    await waitFor(() => {
      expect(screen.getByText("Seed Recipe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create a new Recipe"));
    fireEvent.click(screen.getByText("Create Mock Recipe"));

    await waitFor(() => {
      expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
    });

    const createCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).endsWith("/api/recipes") && (init?.method ?? "GET") === "POST",
    );
    expect(createCall).toBeTruthy();
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      userId: "u1",
      title: "Spaghetti Carbonara",
    });

    fireEvent.click(screen.getByText("Edit Spaghetti Carbonara"));
    fireEvent.click(screen.getByText("Save Mock Recipe"));

    await waitFor(() => {
      expect(
        screen.getByText("Authentic Spaghetti Carbonara"),
      ).toBeInTheDocument();
    });

    const updateCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes("/api/recipes/recipe-1") &&
        (init?.method ?? "GET") === "PUT",
    );
    expect(updateCall).toBeTruthy();
    expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
      userId: "u1",
      title: "Authentic Spaghetti Carbonara",
    });

    fireEvent.click(screen.getByText("Delete Authentic Spaghetti Carbonara"));
    await waitFor(() => {
      expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Authentic Spaghetti Carbonara"),
      ).not.toBeInTheDocument();
    });

    const deleteCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes("/api/recipes/recipe-1") &&
        (init?.method ?? "GET") === "DELETE",
    );
    expect(deleteCall).toBeTruthy();
    expect(JSON.parse(String(deleteCall?.[1]?.body))).toMatchObject({
      userId: "u1",
    });
  });

  it("does not let stale localStorage override the live session user id", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/recipes?") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              recipes: [
                {
                  id: "recipe-1",
                  createdBy: "u1",
                  title: "Owned Recipe",
                  description: "owned",
                  prepingTime: 5,
                  cookingTime: 5,
                  servings: 1,
                  skillLevel: "beginner",
                  dietaryTags: [],
                  ingredients: [{ foodItem: "Water", amount: 1, unit: "cup" }],
                  steps: ["Serve"],
                },
              ],
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("user", JSON.stringify({ _id: "legacy-user-id" }));

    render(<RecipeContent />);

    await waitFor(() => {
      expect(screen.getByText("Owned Recipe")).toBeInTheDocument();
    });

    expect(screen.getByText("Edit Owned Recipe")).toBeInTheDocument();

    localStorage.removeItem("user");
  });

  it("uses a session user _id when id is missing", async () => {
    mockUseUser.mockReturnValue({
      user: { _id: "u1" },
    });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/recipes?") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              recipes: [],
            },
          }),
        } as Response;
      }

      if (url.endsWith("/api/recipes") && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: "u1",
              title: "Spaghetti Carbonara",
              description: "Classic Italian pasta dish",
              prepingTime: 10,
              cookingTime: 15,
              servings: 2,
              skillLevel: "intermediate",
              dietaryTags: [],
              ingredients: [{ foodItem: "Spaghetti", amount: 200, unit: "g" }],
              steps: ["Boil pasta"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeContent />);

    fireEvent.click(screen.getByText("Create a new Recipe"));
    fireEvent.click(screen.getByText("Create Mock Recipe"));

    await waitFor(() => {
      const createCall = fetchMock.mock.calls.find(
        ([url, requestInit]) =>
          String(url).endsWith("/api/recipes") &&
          (requestInit?.method ?? "GET") === "POST",
      );
      expect(createCall).toBeTruthy();
      expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
        userId: "u1",
      });
    });
  });

  it("normalizes skillLevel objects before sending recipe create requests", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
    });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/recipes?") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              recipes: [],
            },
          }),
        } as Response;
      }

      if (url.endsWith("/api/recipes") && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: "u1",
              title: "Spaghetti Carbonara",
              description: "Classic Italian pasta dish",
              prepingTime: 10,
              cookingTime: 15,
              servings: 2,
              skillLevel: "beginner",
              dietaryTags: [],
              ingredients: [{ foodItem: "Spaghetti", amount: 200, unit: "g" }],
              steps: ["Boil pasta"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeContent />);

    fireEvent.click(screen.getByText("Create a new Recipe"));
    fireEvent.click(screen.getByText("Create Mock Recipe"));

    await waitFor(() => {
      const createCall = fetchMock.mock.calls.find(
        ([url, requestInit]) =>
          String(url).endsWith("/api/recipes") &&
          (requestInit?.method ?? "GET") === "POST",
      );
      expect(createCall).toBeTruthy();
      const payload = JSON.parse(String(createCall?.[1]?.body)) as {
        skillLevel?: unknown;
      };
      expect(typeof payload.skillLevel).toBe("string");
    });
  });

  it("does not show a second error after deleting from the recipe view modal", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "u1" },
    });

    window.location.hash = "#recipe?id=recipe-1";

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/recipes?") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              recipes: [
                {
                  id: "recipe-1",
                  createdBy: "u1",
                  title: "Owned Recipe",
                  description: "owned",
                  prepingTime: 5,
                  cookingTime: 5,
                  servings: 1,
                  skillLevel: "beginner",
                  dietaryTags: [],
                  ingredients: [{ foodItem: "Water", amount: 1, unit: "cup" }],
                  steps: ["Serve"],
                },
              ],
            },
          }),
        } as Response;
      }

      if (url.includes("/api/recipes/recipe-1") && method === "DELETE") {
        return {
          ok: true,
          json: async () => ({ message: "Recipe deleted" }),
        } as Response;
      }

      if (url.includes("/api/recipes/recipe-1") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: "recipe-1",
              createdBy: "u1",
              title: "Owned Recipe",
              description: "owned",
              prepingTime: 5,
              cookingTime: 5,
              servings: 1,
              skillLevel: "beginner",
              dietaryTags: [],
              ingredients: [{ foodItem: "Water", amount: 1, unit: "cup" }],
              steps: ["Serve"],
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: {} }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeContent />);

    await waitFor(() => {
      expect(screen.getByTestId("recipe-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete from View"));
    await waitFor(() => {
      expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("Recipe deleted");
    });

    expect(mockToastError).not.toHaveBeenCalledWith("Recipe not found");
    expect(window.location.hash).toBe("#recipe");
  });
});

