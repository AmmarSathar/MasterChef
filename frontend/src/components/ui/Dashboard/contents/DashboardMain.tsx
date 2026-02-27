import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SKILL_LEVELS,
  cuisineOptions,
  dietaryOptions,
  dietaryExclusions,
} from "@masterchef/shared";
import toast from "react-hot-toast";

interface RecipeListItem {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    foodItem: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  steps: string[];
  skillLevel: string;
  cuisine?: string;
  imageUrl?: string;
  cookingTime: number;
  servings: number;
  dietaryTags: string[];
  containsAllergens: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const RECIPES_API_BASE = "/api/recipes";

export function MainDashboardTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Dashboard</h1>;
}

export function MainDashboardContent() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(
    null,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        const hasSearch = debouncedSearch.length > 0;
        const hasFilters =
          difficultyFilter !== "all" ||
          cuisineFilter !== "all" ||
          dietaryFilter !== "all";

        if (hasSearch) {
          params.set("search", debouncedSearch);
        }
        if (hasFilters && difficultyFilter !== "all") {
          params.set("skillLevel", difficultyFilter);
        }
        if (hasFilters && cuisineFilter !== "all") {
          params.set("cuisine", cuisineFilter);
        }
        if (hasFilters && dietaryFilter !== "all") {
          const excludedTags = dietaryExclusions[dietaryFilter as keyof typeof dietaryExclusions] ?? [];
          if (excludedTags.length > 0) {
            params.set("excludeTags", excludedTags.join(","));
          }
        }

        const query = params.toString();
        const res = await fetch(
          query ? `${RECIPES_API_BASE}?${query}` : RECIPES_API_BASE,
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || "Failed to load recipes");
        }

        setRecipes((json?.data?.recipes ?? []) as RecipeListItem[]);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Could not load recipes";
        toast.error(message);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [debouncedSearch, difficultyFilter, cuisineFilter, dietaryFilter]);

  return (
    <div className="dashboard-content w-full h-full flex items-center justify-center pb-4 gap-4">
      <div className="dashboard-content-left bg-card/50 border border-border/50 w-full h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <div className="rounded-xl border border-border/40 bg-input/20 p-4 flex flex-col gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search recipes by title or description..."
              className="pl-10 rounded-xl bg-card/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="all">All Difficulties</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="all">All Cuisines</option>
              {cuisineOptions.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>

            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="all">All Dietary Tags</option>
              {dietaryOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchInput("");
                setDifficultyFilter("all");
                setCuisineFilter("all");
                setDietaryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-foreground/70">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="text-sm text-foreground/70">
            No recipes match your current search/filter.
          </p>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-xl border border-border/40 bg-input/20 p-4 flex flex-col gap-3 cursor-pointer transition-colors hover:bg-input/30"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {recipe.title}
                    </h4>
                    <p className="text-sm text-foreground/70 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-foreground/60 flex flex-wrap gap-3">
                  <span>Time: {recipe.cookingTime}m</span>
                  <span>Servings: {recipe.servings}</span>
                  <span>Difficulty: {recipe.skillLevel}</span>
                  {recipe.cuisine ? <span>Cuisine: {recipe.cuisine}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecipe ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-card p-5 md:p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {selectedRecipe.title}
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  {selectedRecipe.description}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedRecipe(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground/80">
              <p>Difficulty: {selectedRecipe.skillLevel}</p>
              <p>Time: {selectedRecipe.cookingTime} min</p>
              <p>Servings: {selectedRecipe.servings}</p>
              <p>Cuisine: {selectedRecipe.cuisine || "N/A"}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
              {selectedRecipe.ingredients.length === 0 ? (
                <p className="text-sm text-foreground/70">No ingredients listed.</p>
              ) : (
                <ul className="space-y-1 text-sm text-foreground/80 list-disc list-inside">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={`${ingredient.foodItem}-${index}`}>
                      {ingredient.amount} {ingredient.unit} {ingredient.foodItem}
                      {ingredient.notes ? ` (${ingredient.notes})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-foreground mb-2">Steps</h4>
              {selectedRecipe.steps.length === 0 ? (
                <p className="text-sm text-foreground/70">No steps listed.</p>
              ) : (
                <ol className="space-y-2 text-sm text-foreground/80 list-decimal list-inside">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={`${index}-${step}`}>{step}</li>
                  ))}
                </ol>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-foreground/80">
              <p>
                Dietary tags:{" "}
                {selectedRecipe.dietaryTags.length > 0
                  ? selectedRecipe.dietaryTags.join(", ")
                  : "None"}
              </p>
              <p>
                Allergens:{" "}
                {selectedRecipe.containsAllergens.length > 0
                  ? selectedRecipe.containsAllergens.join(", ")
                  : "None listed"}
              </p>
              {selectedRecipe.imageUrl ? (
                <p>
                  Image:{" "}
                  <a
                    href={selectedRecipe.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Open image
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
