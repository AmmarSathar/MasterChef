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

// Creating object ingredients
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted/50 rounded-lg ${className || ""}`}
    />
  );
}
//
function RecipeForm() {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-accent/90">Basic Info</h3>
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-xs font-medium text-foreground/80">
            Title *
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Recipe name"
            className="h-8 text-xs"
            value={formData.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="text-xs font-medium text-foreground/80">
            Description *
          </Label>
          <textarea
            id="description"
            placeholder="Details..."
            className="h-16 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 resize-none"
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="cost" className="text-xs font-medium text-foreground/80">
              Cost ($)
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-8 text-xs"
              value={formData.cost}
              onChange={(e) => handleFormChange("cost", parseFloat(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="difficulty" className="text-xs font-medium text-foreground/80">
              Difficulty
            </Label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleFormChange("difficulty", e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50"
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

      {/* Timing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-accent/90">Timing</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="prep-time" className="text-xs font-medium text-foreground/80">
              Prep (min) *
            </Label>
            <Input
              id="prep-time"
              type="number"
              min="1"
              className="h-8 text-xs"
              value={formData.prepTime}
              onChange={(e) => handleFormChange("prepTime", parseInt(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cook-time" className="text-xs font-medium text-foreground/80">
              Cook (min) *
            </Label>
            <Input
              id="cook-time"
              type="number"
              min="1"
              className="h-8 text-xs"
              value={formData.cookTime}
              onChange={(e) => handleFormChange("cookTime", parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-accent/90">Ingredients *</h3>
          <button
            type="button"
            onClick={addIngredient}
            className="p-1 rounded hover:bg-input/50"
          >
            <Plus className="size-3" />
          </button>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-end gap-1 p-2 rounded-md bg-input/20 border border-border/30"
            >
              <input
                type="text"
                placeholder="Item"
                list="food-list"
                value={ingredient.foodItem}
                onChange={(e) =>
                  updateIngredient(ingredient.id, "foodItem", e.target.value)
                }
                className="h-7 flex-1 rounded border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring"
              />
              <datalist id="food-list">
                {allFoodNames.map((food) => (
                  <option key={food} value={food} />
                ))}
              </datalist>

              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amt"
                className="h-7 w-12 rounded border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring"
                value={ingredient.amount}
                onChange={(e) =>
                  updateIngredient(
                    ingredient.id,
                    "amount",
                    parseFloat(e.target.value)
                  )
                }
              />

              <select
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(ingredient.id, "unit", e.target.value)
                }
                className="h-7 w-16 rounded border border-input bg-transparent px-1 text-xs outline-none focus-visible:border-ring"
              >
                <option value="">Unit</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="cup">cup</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="oz">oz</option>
              </select>

              <button
                type="button"
                onClick={() => removeIngredient(ingredient.id)}
                className="p-1 rounded hover:bg-destructive/20 text-destructive"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-accent/90">Steps *</h3>
          <button
            type="button"
            onClick={addStep}
            className="p-1 rounded hover:bg-input/50"
          >
            <Plus className="size-3" />
          </button>
        </div>

        <div className="space-y-2 max-h-24 overflow-y-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-1 p-2 rounded-md bg-input/20 border border-border/30">
              <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center mt-1">
                {index + 1}
              </div>

              <textarea
                placeholder="Step..."
                value={step.content}
                onChange={(e) => updateStep(step.id, e.target.value)}
                className="w-full rounded border border-input bg-transparent px-1.5 py-1 text-xs outline-none focus-visible:border-ring resize-none h-10"
              />

              <button
                type="button"
                onClick={() => removeStep(step.id)}
                className="p-1 rounded hover:bg-destructive/20 text-destructive shrink-0"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-accent/90">Dietary Tags</h3>
        
        <div className="grid grid-cols-2 gap-1 max-h-20 overflow-y-auto">
          {dietaryOptions.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 p-1.5 rounded border border-border/40 hover:bg-input/20 cursor-pointer"
              onClick={() => handleDietaryToggle(tag)}
            >
              <Checkbox
                checked={formData.dietaryTags.includes(tag)}
                onCheckedChange={() => handleDietaryToggle(tag)}
                className="scale-75"
              />
              <label className="text-xs font-medium text-foreground/80 cursor-pointer select-none">
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border/40">
        <Button type="button" variant="outline" size="sm" className="flex-1 text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1 text-xs h-8">
          Create
        </Button>
      </div>
    </form>
  );
}

export function MainDashboardTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Dashboard</h1>;
}

export function MainDashboardContent() {
  return (
    <div className="dashboard-content w-full h-full flex items-start justify-start pb-4 gap-4">
      <div className="dashboard-content-left bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-2/3 h-20" />
        <Skeleton className="w-full h-40" />
      </div>
      <div className="dashboard-content-right bg-card/50 border border-border/50 w-1/2 h-full flex flex-col relative rounded-2xl p-5 gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-accent/90">New Recipe</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary/70 text-foreground/80 border border-border/60">
            Form
          </span>
        </div>
        <RecipeForm />
      </div>
    </div>
  );
}
