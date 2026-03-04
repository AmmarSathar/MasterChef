import { useEffect, useState } from "react";
import { RecipeContainer } from "@/components/ui/RecipeContainer";

import {
  X,
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@components/ui/badge";
import { Button } from "@/components/ui/button";
import { SKILL_LEVELS, allFoodNames, dietaryOptions } from "@masterchef/shared";
import toast from "react-hot-toast";
import { SAD_KAOMOJIS } from "@masterchef/shared";

import BeefTacos from "@/lib/images/beef-tacos.webp";
import CaesarSalad from "@/lib/images/caesar-salad.webp";
import Carbonara from "@/lib/images/carbonara.webp";
import chickenStirFry from "@/lib/images/chicken-stir-fry.webp";
import ChocolateCookie from "@/lib/images/chocolate-cookie.webp";
import Margherita from "@/lib/images/margherita.webp";

interface Ingredient {
  id: string;
  foodItem: string;
  amount: number | "";
  unit: string;
  notes?: string;
}

interface Step {
  id: string;
  content: string;
}

interface RecipeRecord {
  id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  cost: number;
  difficulty: (typeof SKILL_LEVELS)[number]["value"];
  dietaryTags: string[];
  ingredients: Array<{
    foodItem: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  steps: string[];
}

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  prepTime: "" as number | "",
  cookTime: "" as number | "",
  cost: "" as number | "",
  difficulty: "beginner" as (typeof SKILL_LEVELS)[number]["value"],
  dietaryTags: [] as string[],
};

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "1", foodItem: "", amount: "", unit: "" },
];

const INITIAL_STEPS: Step[] = [{ id: "1", content: "" }];

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
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [pendingDeleteRecipeId, setPendingDeleteRecipeId] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const isEditing = editingRecipeId !== null;

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    mealType: string[];
    skillLevel: string[];
    cookingTime: string[];
  }>({
    mealType: [],
    skillLevel: [],
    cookingTime: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as { id?: string };
      if (parsedUser.id) {
        setCurrentUserId(parsedUser.id);
      }
    } catch {
      setCurrentUserId("");
    }
  }, []);

  // Load user's recipes from backend when we have a user id
  useEffect(() => {
    async function load() {
      if (!currentUserId) return;
      try {
        const res = await fetch(
          `/api/recipes?createdBy=${encodeURIComponent(currentUserId)}`,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load recipes");

        const items = json?.data?.recipes ?? [];
        const mapped: RecipeRecord[] = items.map((r: any) => ({
          id: r.id,
          createdBy: r.createdBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          title: r.title,
          description: r.description,
          // Map backend cookingTime -> cookTime (frontend expects prepTime & cookTime)
          prepTime: 0,
          cookTime: r.cookingTime ?? 0,
          cost: 0,
          difficulty: r.skillLevel,
          dietaryTags: r.dietaryTags ?? [],
          ingredients: r.ingredients ?? [],
          steps: r.steps ?? [],
        }));

        setRecipes(mapped);
      } catch (err: unknown) {
        console.error("Error loading recipes", err);
        const msg =
          err instanceof Error ? err.message : "Could not load recipes";
        toast.error(msg);
      }
    }

    load();
  }, [currentUserId]);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setIngredients(INITIAL_INGREDIENTS);
    setSteps(INITIAL_STEPS);
  };

  const loadRecipeIntoForm = (recipe: RecipeRecord) => {
    setFormData({
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      cost: recipe.cost,
      difficulty: recipe.difficulty,
      dietaryTags: recipe.dietaryTags,
    });

    setIngredients(
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient, index) => ({
            id: String(index + 1),
            ...ingredient,
          }))
        : INITIAL_INGREDIENTS,
    );

    setSteps(
      recipe.steps.length > 0
        ? recipe.steps.map((content, index) => ({
            id: String(index + 1),
            content,
          }))
        : INITIAL_STEPS,
    );
  };

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDietaryTag = (tag: string, checked: boolean) => {
    setFormData((prev) => {
      const prevTags = Array.isArray(prev.dietaryTags) ? prev.dietaryTags : [];
      return {
        ...prev,
        dietaryTags: checked
          ? Array.from(new Set([...prevTags, tag]))
          : prevTags.filter((t) => t !== tag),
      };
    });
  };

  const addIngredient = () => {
    const newId = (
      Math.max(...ingredients.map((i) => parseInt(i.id, 10)), 0) + 1
    ).toString();
    setIngredients([
      ...ingredients,
      { id: newId, foodItem: "", amount: "", unit: "" },
    ]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    } else {
      toast.error("Must have at least one ingredient");
    }
  };

  const updateIngredient = (
    id: string,
    field: keyof Ingredient,
    value: string | number,
  ) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)),
    );
  };

  const addStep = () => {
    const newId = (
      Math.max(...steps.map((s) => parseInt(s.id, 10)), 0) + 1
    ).toString();
    setSteps([...steps, { id: newId, content: "" }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id));
    } else {
      toast.error("Must have at least one step");
    }
  };

  const updateStep = (id: string, content: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, content } : step)),
    );
  };

  const handleStartEdit = (recipe: RecipeRecord) => {
    if (!currentUserId || recipe.createdBy !== currentUserId) return;

    setEditingRecipeId(recipe.id);
    loadRecipeIntoForm(recipe);
  };

  const handleCancel = () => {
    if (isEditing) {
      setEditingRecipeId(null);
      toast("Edit canceled");
    }

    resetForm();
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

  const clearFilters = () => {
    setActiveFilters({ mealType: [], skillLevel: [], cookingTime: [] });
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  const handleRequestDelete = (recipeId: string) => {
    const targetRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (!targetRecipe || targetRecipe.createdBy !== currentUserId) {
      return;
    }

    setPendingDeleteRecipeId(recipeId);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteRecipeId) return;

    (async () => {
      const recipeId = pendingDeleteRecipeId;
      const targetRecipe = recipes.find((recipe) => recipe.id === recipeId);
      if (!targetRecipe || targetRecipe.createdBy !== currentUserId) {
        setPendingDeleteRecipeId(null);
        return;
      }

      try {
        const res = await fetch(
          `/api/recipes/${encodeURIComponent(recipeId)}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
          },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Delete failed");

        setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));

        if (editingRecipeId === recipeId) {
          setEditingRecipeId(null);
          resetForm();
        }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error("Please log in to create or edit recipes");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Recipe title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Recipe description is required");
      return;
    }
    if (
      ingredients.some((ing) => {
        const amount = Number(ing.amount);
        return (
          !ing.foodItem || !ing.unit || amount <= 0 || Number.isNaN(amount)
        );
      })
    ) {
      toast.error("Please fill all ingredient fields");
      return;
    }
    if (steps.some((step) => !step.content.trim())) {
      toast.error("Please fill all step fields");
      return;
    }
    if (
      Number(formData.prepTime) <= 0 ||
      Number(formData.cookTime) <= 0 ||
      Number.isNaN(Number(formData.prepTime)) ||
      Number.isNaN(Number(formData.cookTime))
    ) {
      toast.error("Prep time and cook time must be greater than 0");
      return;
    }

    const recipePayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      ingredients: ingredients.map((ing) => ({
        foodItem: ing.foodItem.trim(),
        amount: Number(ing.amount),
        unit: ing.unit,
        notes: ing.notes,
      })),
      steps: steps.map((s) => s.content.trim()),
      // Map frontend fields to backend schema
      cookingTime:
        Number(formData.prepTime || 0) + Number(formData.cookTime || 0),
      servings: 1,
      skillLevel: formData.difficulty,
      cost: Number(formData.cost || 0),
      dietaryTags: formData.dietaryTags,
    };

    if (isEditing && editingRecipeId) {
      (async () => {
        try {
          const res = await fetch(
            `/api/recipes/${encodeURIComponent(editingRecipeId)}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: currentUserId, ...recipePayload }),
            },
          );
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json?.message || "Update failed");
          }

          const updated = json?.data;
          const updatedAt = updated?.updatedAt ?? new Date().toISOString();

          setRecipes((prev) =>
            prev.map((recipe) =>
              recipe.id === editingRecipeId
                ? {
                    ...recipe,
                    title: updated?.title ?? recipePayload.title,
                    description:
                      updated?.description ?? recipePayload.description,
                    prepTime: recipe.prepTime,
                    cookTime:
                      typeof updated?.cookingTime === "number"
                        ? updated.cookingTime
                        : recipePayload.cookingTime,
                    cost: recipePayload.cost,
                    difficulty: updated?.skillLevel ?? recipePayload.skillLevel,
                    dietaryTags:
                      updated?.dietaryTags ?? recipePayload.dietaryTags,
                    ingredients:
                      updated?.ingredients ?? recipePayload.ingredients,
                    steps: updated?.steps ?? recipePayload.steps,
                    updatedAt,
                  }
                : recipe,
            ),
          );

          setEditingRecipeId(null);
          toast.success("Recipe updated successfully!");
          resetForm();
        } catch (err: unknown) {
          console.error("Update recipe error", err);
          const msg =
            err instanceof Error ? err.message : "Could not update recipe";
          toast.error(msg);
        }
      })();
      return;
    }

    // Create new recipe via API
    (async () => {
      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, ...recipePayload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Create failed");

        const created = json?.data;
        const now = created?.createdAt ?? new Date().toISOString();
        const newRecipe: RecipeRecord = {
          id: created.id,
          createdBy: created.createdBy,
          createdAt: now,
          updatedAt: created.updatedAt ?? now,
          title: created.title,
          description: created.description,
          image: created.imageUrl ?? "",
          prepTime: 0,
          cookTime: created.cookingTime ?? 0,
          cost: recipePayload.cost,
          difficulty: created.skillLevel,
          dietaryTags: created.dietaryTags ?? [],
          ingredients: created.ingredients ?? [],
          steps: created.steps ?? [],
        };

        setRecipes((prev) => [newRecipe, ...prev]);
        toast.success("Recipe created successfully!");
        resetForm();
      } catch (err: unknown) {
        console.error("Create recipe error", err);
        const msg =
          err instanceof Error ? err.message : "Could not create recipe";
        toast.error(msg);
      }
    })();
  };

  const setExampleRecipes = () => {
    const example: RecipeRecord[] = [
      {
        id: "example-1",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Spaghetti Carbonara",
        description:
          "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper. Quick and delicious!",
        image: Carbonara,
        prepTime: 15,
        cookTime: 20,
        cost: 12.5,
        difficulty: "intermediate",
        dietaryTags: ["gluten"],
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Chicken Stir Fry",
        image: chickenStirFry,
        description:
          "A quick and colorful Asian-inspired dish with tender chicken and fresh vegetables in a savory sauce.",
        prepTime: 20,
        cookTime: 15,
        cost: 10.75,
        difficulty: "beginner",
        dietaryTags: ["gluten-free"],
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Margherita Pizza",
        image: Margherita,
        description:
          "Fresh and simple homemade pizza with tomato, mozzarella, basil, and olive oil.",
        prepTime: 30,
        cookTime: 12,
        cost: 8.5,
        difficulty: "intermediate",
        dietaryTags: ["vegetarian"],
        ingredients: [
          { foodItem: "Pizza Dough", amount: 500, unit: "g" },
          { foodItem: "Tomato Sauce", amount: 200, unit: "ml" },
          { foodItem: "Mozzarella", amount: 250, unit: "g" },
          { foodItem: "Fresh Basil", amount: 20, unit: "g" },
          { foodItem: "Olive Oil", amount: 2, unit: "tbsp" },
          { foodItem: "Salt", amount: 1, unit: "tsp" },
        ],
        steps: [
          "Preheat oven to 220°C (425°F).",
          "Roll out pizza dough onto a baking sheet.",
          "Spread tomato sauce evenly on the dough.",
          "Tear mozzarella and distribute over the sauce.",
          "Drizzle with olive oil and sprinkle salt.",
          "Bake for 12 minutes until crust is golden.",
          "Top with fresh basil and serve hot.",
        ],
      },
      {
        id: "example-4",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Caesar Salad",
        image: CaesarSalad,
        description:
          "Classic crisp salad with romaine lettuce, parmesan, croutons, and creamy Caesar dressing.",
        prepTime: 15,
        cookTime: 0,
        cost: 7.25,
        difficulty: "beginner",
        dietaryTags: ["vegetarian"],
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Chocolate Chip Cookies",
        image: ChocolateCookie,
        description:
          "Soft and chewy cookies loaded with chocolate chips. Perfect for dessert or a sweet snack.",
        prepTime: 15,
        cookTime: 12,
        cost: 5.0,
        difficulty: "beginner",
        dietaryTags: ["vegetarian"],
        ingredients: [
          { foodItem: "Butter", amount: 115, unit: "g" },
          { foodItem: "Brown Sugar", amount: 200, unit: "g" },
          { foodItem: "Egg", amount: 1, unit: "pcs" },
          { foodItem: "Vanilla Extract", amount: 1, unit: "tsp" },
          { foodItem: "All-Purpose Flour", amount: 280, unit: "g" },
          { foodItem: "Baking Soda", amount: 1, unit: "tsp" },
          { foodItem: "Salt", amount: 0.5, unit: "tsp" },
          { foodItem: "Chocolate Chips", amount: 200, unit: "g" },
        ],
        steps: [
          "Preheat oven to 190°C (375°F).",
          "Cream butter and brown sugar together.",
          "Beat in egg and vanilla extract.",
          "Mix flour, baking soda, and salt in a separate bowl.",
          "Combine wet and dry ingredients, then fold in chocolate chips.",
          "Drop spoonfuls onto a baking sheet.",
          "Bake for 12 minutes until golden brown.",
        ],
      },
      {
        id: "example-6",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Beef Tacos",
        image: BeefTacos,
        description:
          "Flavorful seasoned ground beef tacos with fresh toppings and warm tortillas.",
        prepTime: 10,
        cookTime: 10,
        cost: 9.5,
        difficulty: "beginner",
        dietaryTags: [],
        ingredients: [
          { foodItem: "Ground Beef", amount: 500, unit: "g" },
          { foodItem: "Taco Seasoning", amount: 2, unit: "tbsp" },
          { foodItem: "Taco Shells", amount: 8, unit: "pcs" },
          { foodItem: "Lettuce", amount: 100, unit: "g" },
          { foodItem: "Tomato", amount: 2, unit: "pcs" },
          { foodItem: "Cheddar Cheese", amount: 100, unit: "g" },
          { foodItem: "Sour Cream", amount: 150, unit: "ml" },
        ],
        steps: [
          "Brown ground beef in a skillet over medium-high heat.",
          "Add taco seasoning and a splash of water, simmer for 5 minutes.",
          "Warm taco shells in the oven.",
          "Chop lettuce and tomato into small pieces.",
          "Shred cheddar cheese.",
          "Fill warm taco shells with beef and your favorite toppings.",
          "Serve with sour cream on the side.",
        ],
      },
    ];

    setRecipes(example);
  };

  useEffect(() => {
    if (recipes.length === 0) {
      setExampleRecipes();
    }
  }, [recipes.length]);

  const filteredRecipes = recipes.filter((recipe) => {
    if (
      activeFilters.skillLevel.length > 0 &&
      !activeFilters.skillLevel.includes(recipe.difficulty)
    ) {
      return false;
    }

    if (activeFilters.cookingTime.length > 0) {
      const totalTime = recipe.prepTime + recipe.cookTime;
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

  return (
    <div className="w-full h-full flex relative flex-col gap-10 overflow-hidden">
      <div className="bg-card/50 w-full flex-1 flex flex-col rounded-2xl p-6 gap-4 overflow-hidden min-h-0">
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
                ? `You currently have ${recipes.length} recipe${recipes.length > 1 ? "s" : ""} in your Kitchen!`
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

            <Button className="flex items-center justify-center gap-2 rounded-full py-6 px-3 bg-primary">
              <Plus size={10} className="pointer-events-none ml-2" />
              <span className="pointer-events-none mr-2">
                Create a new Recipe
              </span>
            </Button>
          </div>
        </div>

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
            className="filter-chips overflow-x-auto flex items-center gap-2 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
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

            <div className="filter-divider w-px h-6 bg-border/40 shrink-0 mx-1" />

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

            <div className="filter-divider w-px h-6 bg-border/40 shrink-0 mx-1" />

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
            type="standard"
          />
        )}
      </div>

      {pendingDeleteRecipeId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
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
        </div>
      )}
      {/* <div className="bg-card/50 border border-border/50 w-full flex flex-col rounded-2xl p-6 gap-10 px-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-accent/90">
              {isEditing ? "Edit Recipe" : "Recipe Creation"}
            </h2>
            <p className="text-sm text-foreground/70">
              {isEditing
                ? "Update your existing recipe details and save your changes."
                : "Create a new recipe by filling out all the fields below."}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary/70 text-foreground/80 border border-border/60">
            {isEditing ? "Edit Mode" : "Form"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-11 ">
          <div className="flex flex-col items-baseline justify-center relative w-full h-full gap-5">
            <span className="text-lg font-semibold text-foreground/80">
              Recipe Information
            </span>

            <div className="flex flex-row gap-10 items-center justify-center w-full h-full relative">
              <div className="flex flex-col w-1/2 gap-8 relative">
                <div className="flex flex-col gap-4 relative">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-foreground/80"
                  >
                    Recipe Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Banana Pancakes"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="rounded-xl px-3 py-8 text-lg font-semibold bg-input/80 border border-border/60"
                  />
                </div>

                <div className="flex flex-col gap-4 relative">
                  <Label
                    htmlFor="cost"
                    className="text-sm font-medium text-foreground/80"
                  >
                    Cost ($) *
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) =>
                      handleFormChange(
                        "cost",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="rounded-xl px-3 py-8 text-lg font-semibold bg-input/80 border border-border/60"
                  />
                </div>
              </div>

              <div className="flex flex-col items-baseline justify-center gap-4 w-2/3 h-full relative">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-foreground/80"
                >
                  Description *
                </Label>
                <textarea
                  id="description"
                  placeholder="Write a detailed description of your recipe..."
                  className="w-full h-full rounded-xl bg-input/80 border border-border/60 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/60 resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-base font-semibold text-accent/90">
              Timing & Difficulty
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="prep-time"
                  className="text-sm font-medium text-foreground/80"
                >
                  Prep Time (minutes) *
                </Label>
                <Input
                  id="prep-time"
                  type="number"
                  min="1"
                  placeholder="15"
                  value={formData.prepTime}
                  onChange={(e) =>
                    handleFormChange(
                      "prepTime",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="cook-time"
                  className="text-sm font-medium text-foreground/80"
                >
                  Cook Time (minutes) *
                </Label>
                <Input
                  id="cook-time"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.cookTime}
                  onChange={(e) =>
                    handleFormChange(
                      "cookTime",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="difficulty"
                  className="text-sm font-medium text-foreground/80"
                >
                  Difficulty Level *
                </Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) =>
                    handleFormChange("difficulty", e.target.value)
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-accent/90">
                Ingredients *
              </span>
              <Button
                type="button"
                onClick={addIngredient}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="size-4" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-end gap-3 p-3 rounded-lg bg-input/30 border border-border/40"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-foreground/70">
                        Ingredient
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Flour"
                        list="food-list"
                        value={ingredient.foodItem}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "foodItem",
                            e.target.value,
                          )
                        }
                        className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
                      />
                      <datalist id="food-list">
                        {allFoodNames.map((food) => (
                          <option key={food} value={food} />
                        ))}
                      </datalist>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-foreground/70">
                        Amount
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="1"
                        value={ingredient.amount}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "amount",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-foreground/70">
                        Unit
                      </label>
                      <select
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "unit",
                            e.target.value,
                          )
                        }
                        className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
                      >
                        <option value="">Select unit</option>
                        <option value="g">Grams (g)</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="l">Liters (l)</option>
                        <option value="cup">Cup</option>
                        <option value="tbsp">Tablespoon (tbsp)</option>
                        <option value="tsp">Teaspoon (tsp)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="pcs">Pieces (pcs)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="shrink-0 p-2 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                    title="Remove ingredient"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-accent/90">
                Steps *
              </span>
              <Button
                type="button"
                onClick={addStep}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="size-4" />
                Add Step
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-input/30 border border-border/40"
                >
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      placeholder="Write the instruction for this step..."
                      value={step.content}
                      onChange={(e) => updateStep(step.id, e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 resize-none min-h-16"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="shrink-0 p-2 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                    title="Remove step"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-base font-semibold text-accent/90">
              Dietary Tags
            </span>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {dietaryOptions.map((tag) => (
                <label
                  key={tag}
                  htmlFor={`dietary-tag-${tag}`}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/40 hover:bg-input/20 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`dietary-tag-${tag}`}
                    checked={formData.dietaryTags.includes(tag)}
                    onCheckedChange={(checked) => {
                      try {
                        toggleDietaryTag(tag, checked === true);
                      } catch (err) {
                        console.error("Dietary checkbox handler error:", err);
                        toast.error("Could not toggle dietary tag");
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-foreground/80 select-none">
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="secondary"
              className="px-6"
              onClick={handleCancel}
            >
              {isEditing ? "Cancel" : "Clear"}
            </Button>
            <Button type="submit" className="px-6">
              {isEditing ? "Save Changes" : "Create Recipe"}
            </Button>
          </div>
        </form>
      </div> */}
    </div>
  );
}
