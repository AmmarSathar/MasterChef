import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockUseUser = vi.hoisted(() => vi.fn());
const { mockFetchMealPlanWeek, mockToMondayIso } = vi.hoisted(() => ({
  mockFetchMealPlanWeek: vi.fn(),
  mockToMondayIso: vi.fn(() => "2026-04-13"),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("@/lib/api/meal-plan", () => ({
  fetchMealPlanWeek: mockFetchMealPlanWeek,
  toMondayIso: mockToMondayIso,
}));

import { MainDashboardContent } from "@/components/ui/Dashboard/contents/DashboardMain";

describe("MainDashboardContent", () => {
  beforeEach(() => {
    window.location.hash = "";

    mockUseUser.mockReturnValue({
      user: {
        id: "user-1",
        email: "nico@example.com",
        name: "Nico Lopez",
        bio: "Always trying a new recipe on Sundays.",
        skill_level: "intermediate",
        cuisines_pref: ["Italian", "Mexican"],
        allergies: ["Peanuts"],
        dietary_restric: ["Vegetarian"],
      },
      loading: false,
      logout: vi.fn(),
      refetchUser: vi.fn(),
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            recipes: [
              {
                id: "r1",
                title: "Tomato Pasta",
                imageUrl: "/pasta.jpg",
              },
              {
                id: "r2",
                title: "Veggie Bowl",
                imageUrl: "/bowl.jpg",
              },
              {
                id: "r3",
                title: "Berry Toast",
                imageUrl: "/toast.jpg",
              },
            ],
          },
        }),
      }),
    );

    const sameDayMeals = {
      breakfast: [
        {
          entryId: "m1",
          recipeId: "rm1",
          title: "Breakfast Burrito",
          description: "",
          imageUrl: "/breakfast.jpg",
          cookingTime: 10,
          notes: "",
        },
      ],
      lunch: [
        {
          entryId: "m2",
          recipeId: "rm2",
          title: "Chicken Wrap",
          description: "",
          imageUrl: "/lunch.jpg",
          cookingTime: 15,
          notes: "",
        },
      ],
      dinner: [
        {
          entryId: "m3",
          recipeId: "rm3",
          title: "Salmon Plate",
          description: "",
          imageUrl: "/dinner.jpg",
          cookingTime: 20,
          notes: "",
        },
      ],
    };

    mockFetchMealPlanWeek.mockResolvedValue({
      id: "plan-1",
      weekStartDate: new Date("2026-04-13"),
      days: {
        Monday: sameDayMeals,
        Tuesday: sameDayMeals,
        Wednesday: sameDayMeals,
        Thursday: sameDayMeals,
        Friday: sameDayMeals,
        Saturday: sameDayMeals,
        Sunday: sameDayMeals,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders dashboard cards, profile data, and recipe previews", async () => {
    render(<MainDashboardContent />);

    expect(screen.getByText("Weekly curations")).toBeInTheDocument();
    expect(screen.getByText("Meals board")).toBeInTheDocument();
    expect(screen.getByText("Recipe studio")).toBeInTheDocument();
    expect(screen.getByText("Nico Lopez")).toBeInTheDocument();
    expect(screen.getByText("nico@example.com")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Tomato Pasta")).toBeInTheDocument();
      expect(screen.getByText("Veggie Bowl")).toBeInTheDocument();
      expect(screen.getByText("Berry Toast")).toBeInTheDocument();
      expect(screen.getByAltText("Breakfast Burrito")).toBeInTheDocument();
      expect(screen.getByAltText("Chicken Wrap")).toBeInTheDocument();
      expect(screen.getByAltText("Salmon Plate")).toBeInTheDocument();
      expect(screen.getByText("Week of Apr 13")).toBeInTheDocument();
      expect(
        screen.getByAltText("Monday Breakfast Breakfast Burrito"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Today:/)).toBeInTheDocument();
    });
  });

  it("updates the hash when a shortcut is clicked", async () => {
    render(<MainDashboardContent />);

    await waitFor(() => {
      expect(screen.getByText("Tomato Pasta")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /weekly curations/i }));
    expect(window.location.hash).toBe("#calendar");

    fireEvent.click(screen.getByRole("button", { name: /recipe studio/i }));
    expect(window.location.hash).toBe("#recipe");
  });
});
