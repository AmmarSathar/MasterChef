import { useState } from "react";
import { X, Plus } from "lucide-react";
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

// Creating Ingredient object
interface Ingredient {
  id: string;
  foodItem: string;
  amount: number;
  unit: string;
  notes?: string;
}

interface Step {
  id: string;
  content: string;
}

export function RecipeFormTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Add a new recipe</h1>;
}

export function RecipeFormContent() {
    // Initialisation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: 0,
    cookTime: 0,
    cost: 0,
    difficulty: "beginner" as const,
    dietaryTags: [] as string[],
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", foodItem: "", amount: 0, unit: "" },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { id: "1", content: "" },
  ]);

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDietaryToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  };

  const addIngredient = () => {
    const newId = (Math.max(...ingredients.map((i) => parseInt(i.id)), 0) + 1).toString();
    setIngredients([...ingredients, { id: newId, foodItem: "", amount: 0, unit: "" }]);
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
    const newId = (Math.max(...steps.map((s) => parseInt(s.id)), 0) + 1).toString();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Recipe title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Recipe description is required");
      return;
    }
    if (ingredients.some((ing) => !ing.foodItem || ing.amount <= 0)) {
      toast.error("Please fill all ingredient fields");
      return;
    }
    if (steps.some((step) => !step.content.trim())) {
      toast.error("Please fill all step fields");
      return;
    }
    if (formData.prepTime <= 0 || formData.cookTime <= 0) {
      toast.error("Prep time and cook time must be greater than 0");
      return;
    }

    const recipe = {
      title: formData.title,
      description: formData.description,
      ingredients: ingredients.map((ing) => ({
        foodItem: ing.foodItem,
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.notes,
      })),
      steps: steps.map((s) => s.content),
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      cost: formData.cost,
      difficulty: formData.difficulty,
      dietaryTags: formData.dietaryTags,
    };

    console.log("Recipe to submit:", recipe);
    toast.success("Recipe created successfully!");
    
    setFormData({
      title: "",
      description: "",
      prepTime: 0,
      cookTime: 0,
      cost: 0,
      difficulty: "beginner",
      dietaryTags: [],
    });
    setIngredients([{ id: "1", foodItem: "", amount: 0, unit: "" }]);
    setSteps([{ id: "1", content: "" }]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
      <div className="bg-card/50 border border-border/50 w-full flex flex-col rounded-2xl p-6 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-accent/90">
              Recipe Creation
            </h2>
            <p className="text-sm text-foreground/70">
              Create a new recipe by filling out all the fields below.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary/70 text-foreground/80 border border-border/60">
            Form
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Info */}
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
                  onChange={(e) => handleFormChange("cost", parseFloat(e.target.value))}
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

          {/* Timing */}
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
                  onChange={(e) => handleFormChange("prepTime", parseInt(e.target.value))}
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
                  onChange={(e) => handleFormChange("cookTime", parseInt(e.target.value))}
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

          {/* Ingredients */}
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
                            parseFloat(e.target.value)
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

          {/* Steps */}
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

          {/* Dietary Tags */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-accent/90">Dietary Tags</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {dietaryOptions.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/40 hover:bg-input/20 transition-colors cursor-pointer"
                  onClick={() => handleDietaryToggle(tag)}
                >
                  <Checkbox
                    checked={formData.dietaryTags.includes(tag)}
                    onCheckedChange={() => handleDietaryToggle(tag)}
                  />
                  <label className="text-sm font-medium text-foreground/80 cursor-pointer select-none">
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="secondary" className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="px-6">
              Create Recipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
