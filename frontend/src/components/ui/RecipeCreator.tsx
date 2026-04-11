import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/UserContext";
import { DietaryOption, SKILL_LEVELS, allFoodNames, dietaryOptions, Recipe } from "@masterchef/shared";
import toast from "react-hot-toast";

import { X, Plus, Minus, Camera, ChefHat } from "lucide-react";

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

const INITIAL_FORM_DATA: Recipe = {
  id: "",
  ingredients: [],
  steps: [],
  containsAllergens: [],
  createdBy: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  title: "",
  description: "",
  prepingTime: 0,
  cookingTime: 0,
  servings: 0,
  skillLevel: SKILL_LEVELS[0].value.toLowerCase() as Recipe["skillLevel"],
  dietaryTags: [] as DietaryOption[],
  isShared: true,
};

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "1", foodItem: "", amount: "", unit: "" },
];
const INITIAL_STEPS: Step[] = [{ id: "1", content: "" }];

const UNITS = ["u", "g", "kg", "ml", "L", "tsp"];

interface RecipeCreatorProps {
  onFinish: (data: Recipe) => void;
  onClose: () => void;
  initialData?: Recipe | null;
}

export default function RecipeCreator({
  onFinish,
  onClose,
  initialData,
}: RecipeCreatorProps) {
  const { user, loading } = useUser();

  const isEditing = !!initialData?.title;

  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isIngredientClicked, setIsIngredientClicked] = useState("");

  const [formData, setFormData] = useState<Recipe>(
    () => initialData || INITIAL_FORM_DATA,
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    initialData?.ingredients?.length
      ? initialData.ingredients.map((ing, i) => ({ id: String(i + 1), ...ing }))
      : INITIAL_INGREDIENTS,
  );
  const [steps, setSteps] = useState<Step[]>(() =>
    initialData?.steps?.length
      ? initialData.steps.map((content, i) => ({ id: String(i + 1), content }))
      : INITIAL_STEPS,
  );
  const [coverImage, setCoverImage] = useState<string>(
    initialData?.imageUrl ?? "",
  );
  const [diataryTags, setDietaryTags] = useState<DietaryOption[]>(
    initialData?.dietaryTags ?? [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingredientContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const stepTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>(
    {},
  );

  useEffect(() => {
    if (!loading) setBusy(false);
  }, [loading, user]);

  const formDisabled = busy || submitting;

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number | string[] | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<
    DietaryOption[]
  >(initialData?.dietaryTags ?? []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dietaryTags: selectedDietaryTags,
    }));
  }, [selectedDietaryTags]);

  const toggleDietaryTag = (tag: DietaryOption, checked: boolean) => {
    setSelectedDietaryTags((prevTags) =>
      checked
        ? Array.from(new Set([...prevTags, tag]))
        : prevTags.filter((t) => t !== tag),
    );
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

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSubmit = (e: HTMLFormElement) => {
    e.preventDefault();

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
      console.log(ingredients);
      toast.error("Please fill all ingredient fields");
      return;
    }

    if (steps.some((step) => !step.content.trim())) {
      toast.error("Please fill all step fields");
      return;
    }

    if (
      Number(formData.prepingTime) <= 0 ||
      Number(formData.cookingTime) <= 0 ||
      Number.isNaN(Number(formData.prepingTime)) ||
      Number.isNaN(Number(formData.cookingTime))
    ) {
      toast.error("Prep time and cook time must be greater than 0");
      return;
    }

    setSubmitting(true);

    onFinish({
      title: formData.title.trim(),
      description: formData.description.trim(),
      prepingTime: Number(formData.prepingTime),
      cookingTime: Number(formData.cookingTime),
      servings: Number(formData.servings) || 1,
      skillLevel: formData.skillLevel,
      isShared: Boolean(formData.isShared),
      dietaryTags: formData.dietaryTags,
      imageUrl: coverImage,
      ingredients: ingredients.map((ing) => ({
        foodItem: ing.foodItem.trim(),
        amount: Number(ing.amount),
        unit: ing.unit,
        notes: ing.notes,
      })),
      steps: steps.map((s) => s.content.trim()),
      containsAllergens: [],
      id: initialData?.id ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id ?? "system",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ingredientContainerRef.current &&
        !ingredientContainerRef.current.contains(event.target as Node)
      ) {
        setIsIngredientClicked("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleOutsideModalClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!modalContentRef.current) return;
      if (modalContentRef.current.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handleOutsideModalClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideModalClick);
    };
  }, [onClose]);

  useEffect(() => {
    autoResizeTextarea(titleRef.current);
  }, [formData.title]);

  useEffect(() => {
    steps.forEach((step) => {
      autoResizeTextarea(stepTextareaRefs.current[step.id] ?? null);
    });
  }, [steps]);

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="recipeCreator-container w-full h-full fixed top-0 left-0 flex items-center justify-center z-50 bg-background/50"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        {busy && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="h-full bg-accent/30 border border-border/50 rounded-2xl w-170 max-h-[90vh] flex items-center justify-center"
          >
            <Spinner variant="infinite" size={44} className="text-accent" />
          </motion.div>
        )}
        <motion.div
          ref={modalContentRef}
          key="creator"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3 }}
          className="recipeCreator-content bg-linear-to-br from-card/95 to-card/80 backdrop-blur-sm border border-border/50 rounded-2xl w-170 max-h-[90vh] py-2 px-2 overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 p-6 pb-4">
            <div className="pr-2 flex-1 min-w-0">
              <textarea
                ref={titleRef}
                id="rc-title"
                placeholder="My new Recipe"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                rows={1}
                className="outline-none transition-all duration-200 rounded-xl p-2 py-4 focus:pl-5 mb-1 w-full bg-none text-4xl leading-tight font-bold text-foreground/60 focus:text-foreground/90 border-border/30 border-dashed ring-1 ring-ring/10 focus:ring-4 focus:ring-ring/60 resize-none overflow-hidden wrap-break-words whitespace-pre-wrap"
              />

              <p className="text-sm text-accent/70 mt-0.5">
                {isEditing
                  ? "Update your recipe details and ingredients"
                  : "Cook up something that should be cooked up"}
              </p>
            </div>
            <Button
              onClick={onClose}
              disabled={formDisabled}
              className="p-2 h-10 w-10 relative flex rounded-full bg-transparent hover:bg-secondary text-foreground opacity-55 hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <X size={20} className="font-bold" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e as unknown as HTMLFormElement);
            }}
            className="flex flex-col gap-12 px-8 py-6"
          >
            <div className="flex gap-5 relative h-60 w-full">
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-sm font-medium text-foreground/70">
                  Recipe Cover
                </span>
                <Button
                  type="button"
                  disabled={formDisabled}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-44 h-full rounded-xl border-2 border-dashed border-border/50 hover:border-accent/50 bg-input/20 hover:bg-input/40 flex flex-col items-center justify-center gap-2 text-foreground/40 hover:text-foreground/60 transition-all duration-200 overflow-hidden"
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera size={24} className="pointer-events-none" />
                      <span className="text-xs text-center px-2 pointer-events-none">
                        Max image size: 5MB
                      </span>
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (formDisabled) return;
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setCoverImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="flex gap-10 flex-col justify-between h-full">
                <div className="cook-prep-container flex-1 flex gap-4">
                  <div className="flex flex-col gap-1.5 relative h-20">
                    <Label
                      htmlFor="rc-cook"
                      className="text-sm font-medium text-foreground/70"
                    >
                      Prep Time
                    </Label>
                    <div className="relative z-0 h-full w-full">
                      <div className="input-increm-decrem w-full h-full flex absolute items-center justify-between px-2 z-10">
                        <Button
                          type="button"
                          disabled={formDisabled}
                          onClick={() =>
                            handleFormChange(
                              "prepingTime",
                              Math.max(
                                0,
                                Number(formData.prepingTime || 0) - 1,
                              ),
                            )
                          }
                          className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none selection:bg-none dark:bg-none rounded-xl relative flex"
                        >
                          <Minus size={16} />
                        </Button>

                        <Button
                          type="button"
                          disabled={formDisabled}
                          onClick={() =>
                            handleFormChange(
                              "prepingTime",
                              Number(formData.prepingTime || 0) + 1,
                            )
                          }
                          className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none rounded-xl relative flex"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <Input
                        id="rc-prep"
                        type="text"
                        min="0"
                        placeholder="45"
                        value={formData.prepingTime}
                        onChange={(e) =>
                          !formDisabled &&
                          handleFormChange(
                            "prepingTime",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="bg-input/40 border-border/50 rounded-xl px-15 h-full"
                      />
                      <span className="absolute right-15 top-1/2 -translate-y-1/2 text-xs text-foreground/40 font-medium pointer-events-none">
                        MINS
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 relative h-20">
                    <Label
                      htmlFor="rc-cook"
                      className="text-sm font-medium text-foreground/70"
                    >
                      Cook Time
                    </Label>
                    <div className="relative z-0 h-full w-full">
                      <div className="input-increm-decrem w-full h-full flex absolute items-center justify-between px-2 z-10">
                        <Button
                          type="button"
                          disabled={formDisabled}
                          onClick={() =>
                            handleFormChange(
                              "cookingTime",
                              Math.max(
                                0,
                                Number(formData.cookingTime || 0) - 1,
                              ),
                            )
                          }
                          className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none selection:bg-none dark:bg-none rounded-xl relative flex"
                        >
                          <Minus size={16} />
                        </Button>

                        <Button
                          type="button"
                          disabled={formDisabled}
                          onClick={() =>
                            handleFormChange(
                              "cookingTime",
                              Number(formData.cookingTime || 0) + 1,
                            )
                          }
                          className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none rounded-xl relative flex"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <Input
                        id="rc-cook"
                        type="text"
                        min="0"
                        placeholder="45"
                        value={formData.cookingTime}
                        onChange={(e) =>
                          !formDisabled &&
                          handleFormChange(
                            "cookingTime",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="bg-input/40 border-border/50 rounded-xl px-15 h-full"
                      />
                      <span className="absolute right-15 top-1/2 -translate-y-1/2 text-xs text-foreground/40 font-medium pointer-events-none">
                        MINS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="rc-desc"
                    className="text-sm font-medium text-foreground/70"
                  >
                    Description
                  </Label>
                  <textarea
                    id="rc-desc"
                    placeholder="Write a short description of your recipe..."
                    value={formData.description}
                    onChange={(e) =>
                      !formDisabled &&
                      handleFormChange("description", e.target.value)
                    }
                    className="w-full rounded-xl bg-input/40 border border-border/50 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/60 resize-none min-h-30 "
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">
                  Ingredients
                </span>
                <Button
                  type="button"
                  disabled={formDisabled}
                  onClick={addIngredient}
                  className="text-sm text-accent hover:text-accent/80 font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus size={14} />
                  Add Ingredient
                </Button>
              </div>

              <AnimatePresence initial={false}>
                <div
                  className="flex flex-col gap-2 transition-all duration-200"
                  ref={ingredientContainerRef}
                >
                  {ingredients.map((ingredient) => (
                    <motion.div
                      key={ingredient.id}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsIngredientClicked(ingredient.id);
                      }}
                      className={`flex flex-col items-start justify-baseline relative gap-2 px-4 py-2.5 rounded-xl bg-input/30 border border-border/30 cursor-pointer group hover:bg-input/50 transition-all duration-200 ease-out-cubic delay-50 overflow-hidden ${isIngredientClicked === ingredient.id ? "min-h-30" : "min-h-15"}`}
                    >
                      <input
                        type="text"
                        placeholder="Add new ingredient..."
                        list="rc-food-list"
                        value={ingredient.foodItem}
                        onChange={(e) =>
                          !formDisabled &&
                          updateIngredient(
                            ingredient.id,
                            "foodItem",
                            e.target.value,
                          )
                        }
                        className={`h-8 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/30 transition-all duration-200`}
                      />

                      <div className="flex flex-col py-2 gap-2 w-full absolute h-10 bottom-2 left-0 overflow-hidden">
                        <div
                          className={`input-increm-decrem h-full w-full flex absolute items-center justify-between px-2 pl-6 z-10 transition-all duration-300 ease-out-cubic ${isIngredientClicked === ingredient.id ? "opacity-100 bottom-0" : "opacity-0 pointer-events-none -bottom-4"}`}
                        >
                          <div className="relative flex flex-col items-center justify-center gap-1 h-15 px-1 py-1 mr-4 -rotate-30 rounded-full ring-2 ring-border/70">
                            <span className="text-xs text-foreground/60 rotate-30 font-medium pointer-events-none">
                              Qtn.
                            </span>
                            <input
                              key={`${ingredient.id}-amount`}
                              value={ingredient.amount}
                              placeholder="0"
                              type="number"
                              inputMode="numeric"
                              onKeyDown={(e) => {
                                if (
                                  !/[0-9.]/.test(e.key) &&
                                  ![
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Tab",
                                  ].includes(e.key)
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) =>
                                !formDisabled &&
                                updateIngredient(
                                  ingredient.id,
                                  "amount",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              className="text-sm text-foreground/80 font-medium text-center rotate-30 w-10 bg-transparent outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={formDisabled}
                            onClick={() =>
                              setIngredients((prev) =>
                                prev.map((ing) =>
                                  ing.id === ingredient.id
                                    ? {
                                        ...ing,
                                        amount: Math.max(
                                          0,
                                          Number(ing.amount || 0) - 1,
                                        ),
                                      }
                                    : ing,
                                ),
                              )
                            }
                            className="text-foreground/40 hover:text-foreground transition-all duration-300 p-2 pr-2 bg-none hover:bg-accent/20 rounded-none rounded-l-xl relative flex"
                          >
                            <Minus size={16} className="pointer-events-none" />
                          </button>

                          <button
                            type="button"
                            disabled={formDisabled}
                            onClick={() =>
                              setIngredients((prev) =>
                                prev.map((ing) =>
                                  ing.id === ingredient.id
                                    ? {
                                        ...ing,
                                        amount: Math.max(
                                          0,
                                          Number(ing.amount || 0) + 1,
                                        ),
                                      }
                                    : ing,
                                ),
                              )
                            }
                            className="text-foreground/40 hover:text-foreground transition-all duration-300 p-2 pr-2 bg-none hover:bg-accent/20 rounded-none rounded-r-xl relative flex"
                          >
                            <Plus size={16} className="pointer-events-none" />
                          </button>
                          <ToggleGroup
                            type="single"
                            size="sm"
                            value={ingredient.unit}
                            className="ml-auto mr-2"
                            onValueChange={(val) => {
                              if (formDisabled) return;
                              if (val)
                                updateIngredient(ingredient.id, "unit", val);
                            }}
                          >
                            {UNITS.map((u) => (
                              <ToggleGroupItem key={u} value={u}>
                                {u}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </div>
                      </div>

                      <datalist id="rc-food-list">
                        {allFoodNames.map((food) => (
                          <option key={food} value={food} />
                        ))}
                      </datalist>
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          disabled={formDisabled}
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-foreground/30 hover:text-destructive bg-none hover:bg-accent/10 transition-all shrink-0 absolute top-2 right-5 cursor-pointer p-3 rounded-full"
                        >
                          <X size={20} className="pointer-events-none" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">
                  Instructions
                </span>
                <Button
                  type="button"
                  disabled={formDisabled}
                  onClick={addStep}
                  className="text-sm text-accent hover:text-accent/80 font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus size={14} />
                  Add Step
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 relative"
                  >
                    <span className="shrink-0 w-6 h-6 mt-3 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 flex items-start gap-2 px-4 py-3 rounded-xl bg-input/30 border border-border/30">
                      <textarea
                        ref={(el) => {
                          stepTextareaRefs.current[step.id] = el;
                        }}
                        placeholder="Step-by-step preparation guide..."
                        value={step.content}
                        onChange={(e) => {
                          if (formDisabled) return;
                          updateStep(step.id, e.target.value);
                          autoResizeTextarea(e.currentTarget);
                        }}
                        onInput={(e) => autoResizeTextarea(e.currentTarget)}
                        className="flex-1 bg-transparent text-sm text-foreground pr-17 outline-none resize-none placeholder:text-foreground/30 min-h-10 overflow-hidden"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          disabled={formDisabled}
                          onClick={() => removeStep(step.id)}
                          className="text-foreground/30 hover:text-destructive bg-none hover:bg-accent/10 transition-all shrink-0 absolute top-3 right-5 cursor-pointer p-3 rounded-full"
                        >
                          <X size={20} className="pointer-events-none" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="recipe-servings flex flex-col gap-1.5 relative h-20 w-full -my-4">
              <div className="flex flex-col gap-3 relative h-20 w-60">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    Servings
                  </span>
                </div>

                <div className="recipe-servings relative z-0 h-full w-full">
                  <div className="input-increm-decrem w-full h-full flex absolute items-center justify-between px-2 z-10">
                    <Button
                      type="button"
                      disabled={formDisabled}
                      onClick={() =>
                        handleFormChange(
                          "servings",
                          Math.max(0, Number(formData.servings || 0) - 1),
                        )
                      }
                      className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none selection:bg-none dark:bg-none rounded-xl relative flex"
                    >
                      <Minus size={16} />
                    </Button>

                    <Button
                      type="button"
                      disabled={formDisabled}
                      onClick={() =>
                        handleFormChange(
                          "servings",
                          Number(formData.servings || 0) + 1,
                        )
                      }
                      className="text-foreground/40 hover:text-foreground transition-all p-1 bg-none rounded-xl relative flex"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <Input
                    id="rc-cook"
                    type="text"
                    min="0"
                    placeholder="45"
                    value={formData.servings}
                    onChange={(e) =>
                      !formDisabled &&
                      handleFormChange(
                        "servings",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="bg-input/40 border-border/50 rounded-xl px-15 h-full w-full pl-20"
                  />
                  <span className="absolute right-15 top-1/2 -translate-y-1/2 text-xs text-foreground/40 font-medium pointer-events-none">
                    SERVINGS
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">
                  Skill Level
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SKILL_LEVELS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={formDisabled}
                    onClick={() => handleFormChange("skillLevel", value)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                      formData.skillLevel === value
                        ? "bg-accent text-card shadow-md"
                        : "bg-input/80 text-foreground/60 hover:bg-input"
                    }`}
                  >
                    <span className="pointer-events-none text-xs font-semibold uppercase tracking-wide">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <span className="text-base font-semibold text-foreground">
                  Dietary Tags
                </span>

                <div className="flex items-center gap-3 flex-wrap">
                  {dietaryOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      disabled={formDisabled}
                      onClick={() =>
                        toggleDietaryTag(
                          tag,
                          !formData.dietaryTags.includes(tag),
                        )
                      }
                      className={`flex flex-col items-center justify-center gap-3 px-6 py-5 rounded-2xl transition-all duration-300 ${
                        formData.dietaryTags.includes(tag)
                          ? "bg-accent text-card shadow-md"
                          : "bg-input/80 text-foreground/80 hover:bg-input"
                      }`}
                    >
                      <span className="text-sm font-semibold pointer-events-none">
                        {tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/40 bg-input/20 px-4 py-3 my-5">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    Share with other users
                  </span>
                  <span className="text-xs text-foreground/60">
                    When off, this recipe stays private and is hidden from
                    global search.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={formDisabled}
                  onClick={() =>
                    handleFormChange("isShared", !(formData.isShared ?? false))
                  }
                  className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-200 ${
                    formData.isShared ? "bg-primary" : "bg-secondary"
                  } ${formDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Toggle recipe sharing"
                  aria-pressed={Boolean(formData.isShared)}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                      formData.isShared ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/30">
                <Button
                  type="button"
                  disabled={formDisabled}
                  onClick={onClose}
                  className="px-5 py-5 text-sm font-medium text-foreground/60 hover:text-foreground transition-all rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formDisabled}
                  className="px-6 py-5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2"
                >
                  {submitting ? (
                    <Spinner
                      size={18}
                      className="text-primary-foreground"
                      variant="infinite"
                    />
                  ) : (
                    <Plus size={15} />
                  )}
                  {isEditing ? "Save Changes" : "Save Recipe"}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
