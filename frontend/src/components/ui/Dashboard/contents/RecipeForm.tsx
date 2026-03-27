import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RecipeContainer } from "@/components/ui/RecipeContainer";
import RecipeCreator from "@/components/ui/RecipeCreator";
import RecipeView from "@/components/ui/RecipeView";

import {
  Plus,
  Wind,
  Coffee,
  UtensilsCrossed,
  Soup,
  Cookie,
  Clock,
  Timer,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Button } from "@/components/ui/button";
import { SKILL_LEVELS } from "@masterchef/shared";
import toast from "react-hot-toast";
import { SAD_KAOMOJIS } from "@masterchef/shared";

import BeefTacos from "@/lib/images/beef-tacos.webp";
import CaesarSalad from "@/lib/images/caesar-salad.webp";
import Carbonara from "@/lib/images/carbonara.webp";
import chickenStirFry from "@/lib/images/chicken-stir-fry.webp";
import ChocolateCookie from "@/lib/images/chocolate-cookie.webp";
import Margherita from "@/lib/images/margherita.webp";

import { Recipe } from "@masterchef/shared";

import { useUser } from "@/context/UserContext";

const RECIPES_API_BASE = "/api/recipes";

const MEAL_TYPES = [
  { label: "Breakfast", icon: Coffee },
  { label: "Lunch", icon: UtensilsCrossed },
  { label: "Dinner", icon: Soup },
  { label: "Snacks", icon: Cookie },
];

const TIME_RANGES = [
  { label: "< 15 mins", value: "under15", icon: Clock },
  { label: "15-30 mins", value: "15to30", icon: Timer },
  { label: "30-60 mins", value: "30to60", icon: Timer },
  { label: "1+ hours", value: "over60", icon: Timer },
];

function normalizeRecipe(recipe: Partial<Recipe>): Recipe {
  const now = new Date();

  return {
    id: recipe.id ?? "",
    createdBy: recipe.createdBy ?? "",
    createdByName: recipe.createdByName,
    createdAt: recipe.createdAt ?? now,
    updatedAt: recipe.updatedAt ?? now,
    title: recipe.title ?? "",
    description: recipe.description ?? "",
    imageUrl: recipe.imageUrl ?? "",
    prepingTime: recipe.prepingTime ?? 0,
    cookingTime: recipe.cookingTime ?? 0,
    servings: recipe.servings ?? 1,
    skillLevel: recipe.skillLevel ?? "beginner",
    dietaryTags: recipe.dietaryTags ?? [],
    isShared: recipe.isShared ?? true,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
    containsAllergens: recipe.containsAllergens ?? [],
  };
}

function SkillBars({ count }: { count: number }) {
  return (
    <span className="skill-bars flex items-end gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="w-1 rounded-xs bg-current"
          style={{ height: `${(i + 1) * 4}px` }}
        />
      ))}
    </span>
  );
}

export function RecipeTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Recipes</h1>;
}

export function RecipeContent() {
  const { user } = useUser();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [pendingDeleteRecipeId, setPendingDeleteRecipeId] = useState<
    string | null
  >(null);
  const [recipeCreateOpen, setRecipeCreateOpen] = useState(false);

  const [debouncedSearch] = useState<string>("");
  // const [searchInput] = useState<string>("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [openedRecipe, setOpenedRecipe] = useState<Recipe | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [pendingEditRecipe, setPendingEditRecipe] = useState<Recipe | null>(
    null,
  );
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);

  const [activeFilters, setActiveFilters] = useState<{
    mealType: string[];
    skillLevel: string[];
    cookingTime: string[];
  }>({ mealType: [], skillLevel: [], cookingTime: [] });

  useEffect(() => {
    if (user?.id) setCurrentUserId(user.id);
  }, [user?.id]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    try {
      const parsedUser = JSON.parse(storedUser) as { id?: string };
      if (parsedUser.id) setCurrentUserId(parsedUser.id);
    } catch {
      setCurrentUserId("");
    }
  }, []);

  // useEffect(() => {
  //   const timeout = window.setTimeout(
  //     () => setDebouncedSearch(searchInput.trim()),
  //     300,
  //   );
  //   return () => window.clearTimeout(timeout);
  // }, [searchInput]);

  useEffect(() => {
    async function load() {
      if (!currentUserId) return;
      try {
        const params = new URLSearchParams();
        params.set("createdBy", currentUserId);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (activeFilters.skillLevel.length === 1)
          params.set("skillLevel", activeFilters.skillLevel[0]);

        const res = await fetch(`${RECIPES_API_BASE}?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load recipes");

        const items = json?.data?.recipes ?? [];
        const mapped: Recipe[] = items.map((recipe: Recipe) =>
          normalizeRecipe(recipe),
        );
        setRecipes(mapped);
      } catch (err: unknown) {
        console.error("Error loading recipes", err);
        const msg =
          err instanceof Error ? err.message : "Could not load recipes";
        toast.error(msg);
      }
    }
    load();
  }, [currentUserId, debouncedSearch, activeFilters.skillLevel]);

  const openCreateModal = () => {
    setEditingRecipe(null);
    setRecipeCreateOpen(true);
  };

  const closeModal = () => {
    setRecipeCreateOpen(false);
    setEditingRecipe(null);
  };

  const handleStartEdit = (recipe: Recipe) => {
    if (!currentUserId || recipe.createdBy !== currentUserId) return;
    setEditingRecipe(recipe);
    setRecipeCreateOpen(true);
  };

  const handleCreatorFinish = (data: Recipe) => {
    if (!currentUserId) {
      toast.error("Please login first");
      return;
    }

    const recipePayload: Partial<Recipe> & {
      dietaryTags?: string[];
      isShared?: boolean;
    } = {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      steps: data.steps,
      cookingTime: data.cookingTime,
      prepingTime: data.prepingTime,
      servings: data.servings,
      skillLevel: data.skillLevel,
      isShared: data.isShared ?? true,
      dietaryTags: data.dietaryTags,
    };

    console.log(recipePayload);

    if (editingRecipe) {
      (async () => {
        try {
          const res = await fetch(
            `${RECIPES_API_BASE}/${encodeURIComponent(editingRecipe.id)}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: currentUserId, ...recipePayload }),
            },
          );
          const json = await res.json();
          if (!res.ok) throw new Error(json?.message || "Update failed");

          const updated = json?.data;
          const updatedAt = updated?.updatedAt ?? new Date();

          console.log(updated);

          setRecipes((prev) =>
            prev.map((r) =>
              r.id === editingRecipe.id
                ? {
                    ...r,
                    title: updated?.title ?? recipePayload.title,
                    description:
                      updated?.description ?? recipePayload.description,
                    prepingTime:
                      typeof updated?.prepingTime === "number"
                        ? updated.prepingTime
                        : data.prepingTime,
                    cookingTime:
                      typeof updated?.cookingTime === "number"
                        ? updated.cookingTime
                        : data.cookingTime,
                    servings: updated?.servings ?? recipePayload.servings,
                    skillLevel: updated?.skillLevel ?? recipePayload.skillLevel,
                    dietaryTags:
                      updated?.dietaryTags ?? data.dietaryTags ?? r.dietaryTags,
                    isShared:
                      typeof updated?.isShared === "boolean"
                        ? updated.isShared
                        : data.isShared ?? r.isShared,
                    ingredients:
                      updated?.ingredients ?? recipePayload.ingredients,
                    steps: updated?.steps ?? recipePayload.steps,
                    imageUrl: data.imageUrl || r.imageUrl,
                    updatedAt,
                  }
                : r,
            ),
          );

          toast.success("Recipe updated successfully!");
          closeModal();

          if (window.location.hash.startsWith("#recipe")) {
            window.location.hash = "recipe";
          }
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : "Could not update recipe";
          toast.error(msg);
        }
      })();
      return;
    }

    (async () => {
      try {
        const res = await fetch(RECIPES_API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, ...recipePayload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Create failed");

        const created = json?.data;
        const now = created?.createdAt ?? new Date();
        const newRecipe: Recipe = {
          id: created.id,
          createdBy: created.createdBy,
          createdAt: now,
          updatedAt: created.updatedAt ?? now,
          title: created.title,
          description: created.description,
          imageUrl: data.imageUrl || created.imageUrl || "",
          prepingTime: created.prepingTime ?? data.prepingTime,
          cookingTime: created.cookingTime ?? data.cookingTime,
          servings: created.servings ?? 1,
          skillLevel: created.skillLevel,
          dietaryTags: created.dietaryTags ?? data.dietaryTags ?? [],
          isShared:
            typeof created?.isShared === "boolean"
              ? created.isShared
              : data.isShared ?? true,
          ingredients: created.ingredients ?? [],
          steps: created.steps ?? [],
          containsAllergens: [],
        };

        setRecipes((prev) => [newRecipe, ...prev]);
        toast.success("Recipe created successfully!");
        closeModal();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Could not create recipe";
        toast.error(msg);
      }
    })();
  };

  const toggleFilter = (
    category: keyof typeof activeFilters,
    value: string,
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearFilters = () =>
    setActiveFilters({ mealType: [], skillLevel: [], cookingTime: [] });

  const activeFilterCount = Object.values(activeFilters).flat().length;

  const handleRequestDelete = (recipeId: string) => {
    const targetRecipe = recipes.find((r) => r.id === recipeId);
    if (!targetRecipe || targetRecipe.createdBy !== currentUserId) return;
    setPendingDeleteRecipeId(recipeId);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteRecipeId) return;

    (async () => {
      const recipeId = pendingDeleteRecipeId;
      const targetRecipe = recipes.find((r) => r.id === recipeId);
      if (!targetRecipe || targetRecipe.createdBy !== currentUserId) {
        setPendingDeleteRecipeId(null);
        return;
      }

      try {
        const res = await fetch(
          `${RECIPES_API_BASE}/${encodeURIComponent(recipeId)}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
          },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Delete failed");

        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
        if (editingRecipe?.id === recipeId) closeModal();
        toast.success("Recipe deleted");
      } catch (err: unknown) {
        console.error("Delete recipe error", err);
        const msg =
          err instanceof Error ? err.message : "Could not delete recipe";
        toast.error(msg);
      } finally {
        setPendingDeleteRecipeId(null);
      }
    })();
  };

  const setExampleRecipes = () => {
    setRecipes([
      {
        id: "example-1",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Spaghetti Carbonara",
        description:
          "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper. Quick and delicious!",
        imageUrl: Carbonara,
        prepingTime: 15,
        cookingTime: 20,
        servings: 2,
        skillLevel: "intermediate",
        dietaryTags: ["Gluten-Free"],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Spaghetti", amount: 200, unit: "g" },
          { foodItem: "Pancetta", amount: 100, unit: "g" },
          { foodItem: "Eggs", amount: 2, unit: "large" },
          { foodItem: "Parmesan Cheese", amount: 50, unit: "g" },
          { foodItem: "Black Pepper", amount: 1, unit: "tsp" },
        ],
        steps: [
          "Cook spaghetti in salted boiling water until al dente.",
          "In a pan, cook pancetta until crispy.",
          "In a bowl, whisk eggs and Parmesan together.",
          "Drain pasta and combine with pancetta. Remove from heat.",
          "Quickly stir in egg mixture to create a creamy sauce.",
          "Season with black pepper and serve immediately.",
        ],
      },
      {
        id: "example-2",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Chicken Stir Fry",
        description:
          "A quick and colorful Asian-inspired dish with tender chicken and fresh vegetables in a savory sauce.",
        imageUrl: chickenStirFry,
        prepingTime: 20,
        cookingTime: 15,
        servings: 2,
        skillLevel: "beginner",
        dietaryTags: ["Gluten-Free"],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Chicken Breast", amount: 400, unit: "g" },
          { foodItem: "Bell Peppers", amount: 2, unit: "pcs" },
          { foodItem: "Broccoli", amount: 200, unit: "g" },
          { foodItem: "Soy Sauce", amount: 3, unit: "tbsp" },
          { foodItem: "Garlic", amount: 3, unit: "cloves" },
          { foodItem: "Ginger", amount: 1, unit: "tbsp" },
        ],
        steps: [
          "Cut chicken into bite-sized pieces and vegetables into chunks.",
          "Heat oil in a wok or large skillet over high heat.",
          "Cook chicken until browned, then set aside.",
          "Stir fry vegetables until tender-crisp.",
          "Return chicken to the wok, add soy sauce, garlic, and ginger.",
          "Toss everything together and serve over rice.",
        ],
      },
      {
        id: "example-3",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Margherita Pizza",
        description:
          "Fresh and simple homemade pizza with tomato, mozzarella, basil, and olive oil.",
        imageUrl: Margherita,
        prepingTime: 30,
        cookingTime: 12,
        servings: 4,
        skillLevel: "intermediate",
        dietaryTags: ["Vegetarian"],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Pizza Dough", amount: 500, unit: "g" },
          { foodItem: "Tomato Sauce", amount: 200, unit: "ml" },
          { foodItem: "Mozzarella", amount: 250, unit: "g" },
          { foodItem: "Fresh Basil", amount: 20, unit: "g" },
          { foodItem: "Olive Oil", amount: 2, unit: "tbsp" },
        ],
        steps: [
          "Preheat oven to 220°C (425°F).",
          "Roll out pizza dough onto a baking sheet.",
          "Spread tomato sauce evenly on the dough.",
          "Tear mozzarella and distribute over the sauce.",
          "Drizzle with olive oil and bake for 12 minutes until crust is golden.",
          "Top with fresh basil and serve hot.",
        ],
      },
      {
        id: "example-4",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Caesar Salad",
        description:
          "Classic crisp salad with romaine lettuce, parmesan, croutons, and creamy Caesar dressing.",
        imageUrl: CaesarSalad,
        prepingTime: 15,
        cookingTime: 0,
        servings: 2,
        skillLevel: "beginner",
        dietaryTags: ["Vegetarian"],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Romaine Lettuce", amount: 1, unit: "head" },
          { foodItem: "Parmesan Cheese", amount: 75, unit: "g" },
          { foodItem: "Croutons", amount: 100, unit: "g" },
          { foodItem: "Caesar Dressing", amount: 150, unit: "ml" },
          { foodItem: "Lemon", amount: 0.5, unit: "pcs" },
        ],
        steps: [
          "Wash and chop romaine lettuce into bite-sized pieces.",
          "Place lettuce in a large salad bowl.",
          "Add croutons and half the parmesan cheese.",
          "Pour Caesar dressing and toss gently.",
          "Top with remaining parmesan and a squeeze of fresh lemon.",
          "Serve immediately.",
        ],
      },
      {
        id: "example-5",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Chocolate Chip Cookies",
        description:
          "Soft and chewy cookies loaded with chocolate chips. Perfect for dessert or a sweet snack.",
        imageUrl: ChocolateCookie,
        prepingTime: 15,
        cookingTime: 12,
        servings: 12,
        skillLevel: "beginner",
        dietaryTags: ["Vegetarian"],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Butter", amount: 115, unit: "g" },
          { foodItem: "Brown Sugar", amount: 200, unit: "g" },
          { foodItem: "Egg", amount: 1, unit: "pcs" },
          { foodItem: "Vanilla Extract", amount: 1, unit: "tsp" },
          { foodItem: "All-Purpose Flour", amount: 280, unit: "g" },
          { foodItem: "Chocolate Chips", amount: 200, unit: "g" },
        ],
        steps: [
          "Preheat oven to 190°C (375°F).",
          "Cream butter and brown sugar together.",
          "Beat in egg and vanilla extract.",
          "Mix flour, baking soda, and salt in a separate bowl.",
          "Combine wet and dry ingredients, then fold in chocolate chips.",
          "Drop spoonfuls onto a baking sheet and bake for 12 minutes until golden.",
        ],
      },
      {
        id: "example-6",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "Beef Tacos",
        description:
          "Flavorful seasoned ground beef tacos with fresh toppings and warm tortillas.",
        imageUrl: BeefTacos,
        prepingTime: 10,
        cookingTime: 10,
        servings: 4,
        skillLevel: "beginner",
        dietaryTags: [],
        containsAllergens: [],
        ingredients: [
          { foodItem: "Ground Beef", amount: 500, unit: "g" },
          { foodItem: "Taco Seasoning", amount: 2, unit: "tbsp" },
          { foodItem: "Taco Shells", amount: 8, unit: "pcs" },
          { foodItem: "Lettuce", amount: 100, unit: "g" },
          { foodItem: "Tomato", amount: 2, unit: "pcs" },
          { foodItem: "Cheddar Cheese", amount: 100, unit: "g" },
        ],
        steps: [
          "Brown ground beef in a skillet over medium-high heat.",
          "Add taco seasoning and a splash of water, simmer for 5 minutes.",
          "Warm taco shells in the oven.",
          "Chop lettuce and tomato into small pieces.",
          "Fill warm taco shells with beef and your favorite toppings.",
          "Serve with sour cream on the side.",
        ],
      },
    ]);
  };

  useEffect(() => {
    if (recipes.length === 0) setExampleRecipes();
  }, [recipes.length]);

  const getRecipeIdFromHash = () => {
    const raw = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    if (!raw.startsWith("recipe")) return null;
    const query = raw.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    const id = params.get("id");
    return id || null;
  };

  const handleAddToCollection = async (recipe: Recipe) => {
    if (!currentUserId) {
      toast.error("Please login first");
      return;
    }

    setIsAddingToCollection(true);
    try {
      const payload = {
        userId: currentUserId,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients ?? [],
        steps: recipe.steps ?? [],
        cookingTime: recipe.cookingTime ?? 0,
        servings: recipe.servings ?? 1,
        skillLevel: recipe.skillLevel,
        imageUrl: recipe.imageUrl ?? "",
        isShared: false,
      };

      const res = await fetch(RECIPES_API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to add recipe");
      }

      const created = normalizeRecipe(json?.data as Recipe);
      setRecipes((prev) => [created, ...prev]);
      toast.success("Recipe added to your collection");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not add recipe";
      toast.error(msg);
    } finally {
      setIsAddingToCollection(false);
    }
  };

  useEffect(() => {
    const openFromHashAsync = async () => {
      const id = getRecipeIdFromHash();
      if (!id) return;

      const found = recipes.find((r) => r.id === id);
      if (found) {
        setRecipeCreateOpen(false);
        setEditingRecipe(null);
        setOpenedRecipe(found);
        window.setTimeout(() => setViewOpen(true), 120);
        return;
      }

      try {
        const res = await fetch(`${RECIPES_API_BASE}/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message || "Failed to load recipe");
        }
        const remoteRecipe = normalizeRecipe(json?.data as Recipe);
        setRecipeCreateOpen(false);
        setEditingRecipe(null);
        setOpenedRecipe(remoteRecipe);
        window.setTimeout(() => setViewOpen(true), 120);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Could not open this recipe";
        toast.error(msg);
      }
    };

    void openFromHashAsync();
    const onHash = () => void openFromHashAsync();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [recipes]);

  const filteredRecipes = recipes.filter((recipe) => {
    if (
      activeFilters.skillLevel.length > 0 &&
      !activeFilters.skillLevel.includes(recipe.skillLevel)
    )
      return false;

    if (activeFilters.cookingTime.length > 0) {
      const totalTime = recipe.prepingTime + recipe.cookingTime;
      const matchesTime = activeFilters.cookingTime.some((range) => {
        switch (range) {
          case "under15":
            return totalTime < 15;
          case "15to30":
            return totalTime >= 15 && totalTime <= 30;
          case "30to60":
            return totalTime > 30 && totalTime <= 60;
          case "over60":
            return totalTime > 60;
          default:
            return true;
        }
      });
      if (!matchesTime) return false;
    }

    if (activeFilters.mealType.length > 0) {
      const text = `${recipe.title} ${recipe.description}`.toLowerCase();
      const matchesMeal = activeFilters.mealType.some((type) => {
        switch (type) {
          case "Breakfast":
            return /breakfast|pancake|waffle|omelette|cereal|morning|brunch|toast/i.test(
              text,
            );
          case "Lunch":
            return /lunch|sandwich|wrap|salad|soup/i.test(text);
          case "Dinner":
            return /dinner|steak|roast|pasta|curry|casserole|stir.?fry|taco/i.test(
              text,
            );
          case "Snacks":
            return /snack|cookie|chips|dip|appetizer|bite|treat|dessert/i.test(
              text,
            );
          default:
            return true;
        }
      });
      if (!matchesMeal) return false;
    }

    return true;
  });

  const onRecipeSelect = (recipe: Recipe) => {
    setRecipeCreateOpen(false);
    setOpenedRecipe(recipe);
    window.location.hash = `recipe?id=${encodeURIComponent(recipe.id)}`;
    window.setTimeout(() => setViewOpen(true), 120);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRecipeCreateOpen(false);
        setEditingRecipe(null);
        setViewOpen(false);
        setOpenedRecipe(null);
        setPendingDeleteRecipeId(null);
        setFilterOpen(false);

        if (window.location.hash.startsWith("#recipe")) {
          window.location.hash = "recipe";
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  return (
    <div className="w-full h-full flex relative flex-col gap-10 overflow-hidden">
      <div className="bg-card/50 w-full flex-1 flex flex-col rounded-2xl p-6 gap-4 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-baseline">
            <div className="flex items-center justify-baseline gap-5">
              <span className="text-3xl font-bold text-card-foreground/90">
                My Collection
              </span>
              <Badge className="text-xs px-3 py-1 text-foreground/80 bg-card ring-2 ring-accent/50 opacity-70 -mb-1.5">
                {recipes.length} total
              </Badge>
            </div>
            <p className="py-4 flex text-left text-sm text-foreground/70">
              {recipes.length > 1
                ? `You currently have ${recipes.length} recipes in your Kitchen!`
                : "Only dust.."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              disabled={recipes.length === 0}
              onClick={() => setFilterOpen((prev) => !prev)}
              className={`flex items-center justify-center gap-2 rounded-full py-6 px-3 transition-all duration-300 cursor-pointer ${
                filterOpen
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "bg-secondary hover:bg-secondary/60"
              }`}
            >
              <SlidersHorizontal
                size={14}
                className="pointer-events-none ml-1"
              />
              <span className="pointer-events-none mr-1">Filter</span>
              {activeFilterCount > 0 && (
                <span className="pointer-events-none ml-0.5 min-w-5 h-5 flex items-center justify-center rounded-full bg-accent/90 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-full py-6 px-3 bg-primary"
            >
              <Plus size={10} className="pointer-events-none ml-2" />
              <span className="pointer-events-none mr-2">
                Create a new Recipe
              </span>
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div
          className={`filter-menu w-full flex flex-col gap-3 transition-all duration-300 ease-out ${
            filterOpen
              ? "opacity-100 mt-0 pointer-events-auto"
              : "opacity-0 -mt-14 pointer-events-none"
          }`}
        >
          <div className="filter-header flex items-center gap-2 px-1">
            <SlidersHorizontal size={14} className="text-foreground/50" />
            <span className="text-sm font-semibold text-foreground/60">
              Quick Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-medium text-accent/70 hover:text-accent transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div
            className="filter-groups overflow-x-auto flex items-start gap-4 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="shrink-0 flex flex-col gap-2 min-w-max">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/45 px-1">
                Meal Type
              </span>
              <div className="flex items-center gap-2">
                {MEAL_TYPES.map(({ label, icon: Icon }) => {
                  const isActive = activeFilters.mealType.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleFilter("mealType", label)}
                      className={`filter-chip shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer select-none ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "bg-secondary/50 text-foreground/70 ring-2 ring-border/30 hover:bg-secondary/80 hover:text-foreground/90"
                      }`}
                    >
                      <Icon size={15} className="pointer-events-none" />
                      <span className="pointer-events-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-px h-16 bg-border/35 shrink-0 mt-4" />

            <div className="shrink-0 flex flex-col gap-2 min-w-max">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/45 px-1">
                Skill Level
              </span>
              <div className="flex items-center gap-2">
                {SKILL_LEVELS.map((level, index) => {
                  const isActive = activeFilters.skillLevel.includes(level.value);
                  return (
                    <button
                      key={level.value}
                      onClick={() => toggleFilter("skillLevel", level.value)}
                      className={`filter-chip shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer select-none ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "bg-secondary/50 text-foreground/70 ring-2 ring-border/30 hover:bg-secondary/80 hover:text-foreground/90"
                      }`}
                    >
                      <SkillBars count={index + 1} />
                      <span className="pointer-events-none">{level.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-px h-16 bg-border/35 shrink-0 mt-4" />

            <div className="shrink-0 flex flex-col gap-2 min-w-max">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/45 px-1">
                Cooking Time
              </span>
              <div className="flex items-center gap-2">
                {TIME_RANGES.map(({ label, value, icon: Icon }) => {
                  const isActive = activeFilters.cookingTime.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleFilter("cookingTime", value)}
                      className={`filter-chip shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer select-none ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "bg-secondary/50 text-foreground/70 ring-2 ring-border/30 hover:bg-secondary/80 hover:text-foreground/90"
                      }`}
                    >
                      <Icon size={15} className="pointer-events-none" />
                      <span className="pointer-events-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe list or empty state */}
        {recipes.length === 0 || filteredRecipes.length === 0 ? (
          <div className="no-recipe-container flex flex-col items-center justify-center gap-2 w-full flex-1 border-2 border-dashed border-border/30 rounded-lg -mt-40 pointer-events-none">
            <Wind size={28} className="opacity-80" />
            <span className="text-2xl text-center text-bold text-foreground/80">
              There's.. Nothing to show here
            </span>
            <div className="text-center text-foreground/50 flex items-center justify-center gap-2">
              <span className="text-sm">No recipes found</span>
              <span className="text-xl mb-1">
                {SAD_KAOMOJIS[Math.floor(Math.random() * SAD_KAOMOJIS.length)]}
              </span>
            </div>
          </div>
        ) : (
          <RecipeContainer
            recipes={filteredRecipes}
            currentUserId={currentUserId}
            onEdit={handleStartEdit}
            onDelete={handleRequestDelete}
            onSelect={onRecipeSelect}
            type="standard"
          />
        )}
      </div>
      {/* Recipe Creator modal */}
      <AnimatePresence>
        {recipeCreateOpen && (
          <RecipeCreator
            key="recipe-creator"
            initialData={
              editingRecipe
                ? {
                    title: editingRecipe.title,
                    description: editingRecipe.description,
                    prepingTime: editingRecipe.prepingTime,
                    cookingTime: editingRecipe.cookingTime,
                    servings: editingRecipe.servings,
                    skillLevel: editingRecipe.skillLevel,
                    dietaryTags: editingRecipe.dietaryTags,
                    isShared: editingRecipe.isShared ?? true,
                    containsAllergens: editingRecipe.containsAllergens,
                    id: editingRecipe.id,
                    createdBy: editingRecipe.createdBy,
                    createdAt: editingRecipe.createdAt,
                    imageUrl: editingRecipe.imageUrl,
                    ingredients: editingRecipe.ingredients,
                    steps: editingRecipe.steps,
                    updatedAt: editingRecipe.updatedAt,
                    createdByName: editingRecipe.createdByName,
                    cuisine: editingRecipe.cuisine,
                  }
                : null
            }
            onFinish={handleCreatorFinish}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
      {/* Recipe view modal */}
      <AnimatePresence
        onExitComplete={() => {
          if (pendingEditRecipe) {
            handleStartEdit(pendingEditRecipe);
            setPendingEditRecipe(null);
          }
        }}
      >
        {openedRecipe && viewOpen && (
          <RecipeView
            key={`recipe-view-${openedRecipe.id}`}
            recipe={openedRecipe}
            isOwner={openedRecipe.createdBy === currentUserId}
            isAddingToCollection={isAddingToCollection}
            onClose={() => {
              setViewOpen(false);
              setOpenedRecipe(null);
              if (window.location.hash.startsWith("#recipe")) {
                window.location.hash = "recipe";
              }
            }}
            onEdit={(r) => {
              setPendingEditRecipe(r);
              setViewOpen(false);
              setOpenedRecipe(null);
              if (window.location.hash.startsWith("#recipe")) {
                window.location.hash = "recipe";
              }
            }}
            onDelete={(id) => handleRequestDelete(id)}
            onAddToCollection={handleAddToCollection}
          />
        )}
      </AnimatePresence>
      {/* Delete confirm */}
      <AnimatePresence>
        {pendingDeleteRecipeId && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)", y: 0 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
              <h4 className="text-base font-semibold text-accent/90">
                Confirm Delete
              </h4>
              <p className="mt-2 text-sm text-foreground/75">
                Are you sure you want to delete this recipe?
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingDeleteRecipeId(null)}
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  Yes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
