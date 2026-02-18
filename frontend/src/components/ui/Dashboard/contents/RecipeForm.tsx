import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  SKILL_LEVELS,
  allFoodNames,
  dietaryOptions,
} from "@masterchef/shared";
import toast from "react-hot-toast";

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

export function RecipeFormTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Add a new recipe</h1>;
}

export function RecipeFormContent() {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [pendingDeleteRecipeId, setPendingDeleteRecipeId] = useState<string | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  const isEditing = editingRecipeId !== null;

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
        : INITIAL_INGREDIENTS
    );

    setSteps(
      recipe.steps.length > 0
        ? recipe.steps.map((content, index) => ({
            id: String(index + 1),
            content,
          }))
        : INITIAL_STEPS
    );
  };

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number | string[]
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
    const newId = (Math.max(...ingredients.map((i) => parseInt(i.id, 10)), 0) + 1).toString();
    setIngredients([...ingredients, { id: newId, foodItem: "", amount: "", unit: "" }]);
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
    value: string | number
  ) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const addStep = () => {
    const newId = (Math.max(...steps.map((s) => parseInt(s.id, 10)), 0) + 1).toString();
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
      prev.map((step) => (step.id === id ? { ...step, content } : step))
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

  const handleRequestDelete = (recipeId: string) => {
    const targetRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (!targetRecipe || targetRecipe.createdBy !== currentUserId) {
      return;
    }

    setPendingDeleteRecipeId(recipeId);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteRecipeId) return;

    const recipeId = pendingDeleteRecipeId;
    const targetRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (!targetRecipe || targetRecipe.createdBy !== currentUserId) {
      setPendingDeleteRecipeId(null);
      return;
    }

    setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));

    if (editingRecipeId === recipeId) {
      setEditingRecipeId(null);
      resetForm();
    }

    setPendingDeleteRecipeId(null);
    toast.success("Recipe deleted");
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
        return !ing.foodItem || !ing.unit || amount <= 0 || Number.isNaN(amount);
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
      prepTime: Number(formData.prepTime),
      cookTime: Number(formData.cookTime),
      cost: Number(formData.cost || 0),
      difficulty: formData.difficulty,
      dietaryTags: formData.dietaryTags,
    };

    if (isEditing && editingRecipeId) {
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === editingRecipeId
            ? {
                ...recipe,
                ...recipePayload,
                updatedAt: new Date().toISOString(),
              }
            : recipe
        )
      );

      setEditingRecipeId(null);
      toast.success("Recipe updated successfully!");
      resetForm();
      return;
    }

    const now = new Date().toISOString();
    const newRecipe: RecipeRecord = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : String(Date.now()),
      createdBy: currentUserId,
      createdAt: now,
      updatedAt: now,
      ...recipePayload,
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    toast.success("Recipe created successfully!");
    resetForm();
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
      <div className="bg-card/50 border border-border/50 w-full flex flex-col rounded-2xl p-6 gap-6">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-accent/90">
              Recipe Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground/80">
                  Recipe Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Banana Pancakes"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cost" className="text-sm font-medium text-foreground/80">
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
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground/80">
                Description *
              </Label>
              <textarea
                id="description"
                placeholder="Write a detailed description of your recipe..."
                className="min-h-24 w-full rounded-xl bg-input/80 border border-border/60 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/60 resize-none"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-accent/90">Timing & Difficulty</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prep-time" className="text-sm font-medium text-foreground/80">
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
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cook-time" className="text-sm font-medium text-foreground/80">
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
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="difficulty" className="text-sm font-medium text-foreground/80">
                  Difficulty Level *
                </Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleFormChange("difficulty", e.target.value)}
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
              <h3 className="text-base font-semibold text-accent/90">Ingredients *</h3>
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
                          updateIngredient(ingredient.id, "foodItem", e.target.value)
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
                            e.target.value === "" ? "" : Number(e.target.value)
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
                          updateIngredient(ingredient.id, "unit", e.target.value)
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
              <h3 className="text-base font-semibold text-accent/90">Steps *</h3>
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
                <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg bg-input/30 border border-border/40">
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
            <h3 className="text-base font-semibold text-accent/90">Dietary Tags</h3>

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
            <Button type="button" variant="secondary" className="px-6" onClick={handleCancel}>
              {isEditing ? "Cancel" : "Clear"}
            </Button>
            <Button type="submit" className="px-6">
              {isEditing ? "Save Changes" : "Create Recipe"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card/50 border border-border/50 w-full flex flex-col rounded-2xl p-6 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-accent/90">Your Recipes</h3>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary/70 text-foreground/80 border border-border/60">
            {recipes.length} total
          </span>
        </div>

        {recipes.length === 0 ? (
          <p className="text-sm text-foreground/70">No recipes created yet.</p>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => {
              const isOwner = recipe.createdBy === currentUserId;

              return (
                <div
                  key={recipe.id}
                  className="rounded-xl border border-border/40 bg-input/20 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{recipe.title}</h4>
                      <p className="text-sm text-foreground/70 line-clamp-2">{recipe.description}</p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleStartEdit(recipe)}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleRequestDelete(recipe.id)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-foreground/60 flex flex-wrap gap-3">
                    <span>Prep: {recipe.prepTime}m</span>
                    <span>Cook: {recipe.cookTime}m</span>
                    <span>Difficulty: {recipe.difficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingDeleteRecipeId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
            <h4 className="text-base font-semibold text-accent/90">Confirm Delete</h4>
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
    </div>
  );
}
