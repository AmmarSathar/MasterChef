import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@context/UserContext";
import { DAYS_OF_WEEK, MEAL_TYPES } from "@masterchef/shared/constants";
import type { Recipe } from "@masterchef/shared/types/recipe";
import toast from "react-hot-toast";

type DayOfWeek = (typeof DAYS_OF_WEEK)[number]["value"];
type MealType = (typeof MEAL_TYPES)[number]["value"];

type MealSlot = {
  entryId: string;
  recipeId: string;
  title: string;
  notes: string;
};

type MealPlan = {
  id: string;
  weekStartDate: string;
  days: Record<DayOfWeek, Record<MealType, MealSlot | null>>;
};

type AssignState = {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
};

function getMonday(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatWeekStart(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

function formatWeekStartApi(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T00:00:00.000Z`;
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => undefined);
  return data as
    | {
        success?: boolean;
        data?: unknown;
        error?: string;
        message?: string;
      }
    | undefined;
}

async function getMealPlan(weekStartDate: Date) {
  const params = new URLSearchParams({
    week_start_date: formatWeekStartApi(weekStartDate),
  });
  const response = await fetch(`/api/meal-plans?${params.toString()}`, {
    credentials: "include",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Failed to load meal plan";
    throw Object.assign(new Error(message), { status: response.status });
  }

  return payload?.data as MealPlan;
}

async function createMealPlan(weekStartDate: Date) {
  const response = await fetch("/api/meal-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      week_start_date: formatWeekStartApi(weekStartDate),
    }),
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Failed to create meal plan";
    throw Object.assign(new Error(message), { status: response.status });
  }

  return payload?.data as MealPlan;
}

async function ensureMealPlan(weekStartDate: Date) {
  try {
    return await getMealPlan(weekStartDate);
  } catch (error) {
    if ((error as { status?: number }).status !== 404) {
      throw error;
    }
  }

  return createMealPlan(weekStartDate);
}

export function MealsTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Meals</h1>;
}

export function MealsContent() {
  const { user } = useUser();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickerState, setPickerState] = useState<AssignState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assigningRecipeId, setAssigningRecipeId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRecipes() {
      if (!user?.id) {
        if (active) {
          setRecipes([]);
          setIsLoadingRecipes(false);
        }
        return;
      }

      setIsLoadingRecipes(true);
      try {
        const params = new URLSearchParams({
          createdBy: user.id,
          limit: "100",
        });
        const response = await fetch(`/api/recipes?${params.toString()}`, {
          credentials: "include",
        });
        const payload = await readJson(response);
        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || "Failed to load recipes");
        }

        const nextRecipes = ((payload?.data as { recipes?: Recipe[] } | undefined)?.recipes ?? []) as Recipe[];
        if (active) {
          setRecipes(nextRecipes);
        }
      } catch (error) {
        if (active) {
          setRecipes([]);
          toast.error((error as Error).message || "Failed to load recipes");
        }
      } finally {
        if (active) {
          setIsLoadingRecipes(false);
        }
      }
    }

    void loadRecipes();

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    async function loadMealPlan() {
      setIsLoadingPlan(true);
      setLoadError(null);

      try {
        const plan = await ensureMealPlan(weekStart);
        if (active) {
          setMealPlan(plan);
        }
      } catch (error) {
        if (active) {
          setMealPlan(null);
          setLoadError((error as Error).message || "Failed to load meal plan");
        }
      } finally {
        if (active) {
          setIsLoadingPlan(false);
        }
      }
    }

    void loadMealPlan();

    return () => {
      active = false;
    };
  }, [weekStart]);

  const days = useMemo(() => {
    return DAYS_OF_WEEK.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        ...day,
        shortLabel: day.label.slice(0, 3),
        date,
      };
    });
  }, [weekStart]);

  const filteredRecipes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return recipes;
    }

    return recipes.filter((recipe) => {
      return [recipe.title, recipe.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [recipes, searchTerm]);

  const selectedSlot = pickerState
    ? mealPlan?.days[pickerState.dayOfWeek]?.[pickerState.mealType] ?? null
    : null;
  const assignedRecipeCounts = useMemo(() => {
    const counts = new Map<string, number>();

    if (!mealPlan) {
      return counts;
    }

    for (const day of DAYS_OF_WEEK) {
      for (const mealType of MEAL_TYPES) {
        const slot = mealPlan.days[day.value][mealType.value];
        if (!slot?.recipeId) {
          continue;
        }

        counts.set(slot.recipeId, (counts.get(slot.recipeId) ?? 0) + 1);
      }
    }

    return counts;
  }, [mealPlan]);

  async function handleAssignRecipe(recipe: Recipe) {
    if (!mealPlan || !pickerState) {
      return;
    }

    setAssigningRecipeId(recipe.id);
    setAssignmentError(null);

    const existingSlot = mealPlan.days[pickerState.dayOfWeek][pickerState.mealType];
    const isUpdate = Boolean(existingSlot?.entryId);
    const endpoint = isUpdate
      ? `/api/meal-plans/entries/${existingSlot?.entryId}`
      : `/api/meal-plans/${mealPlan.id}/entries`;
    const method = isUpdate ? "PUT" : "POST";
    const body = isUpdate
      ? { recipe_id: recipe.id }
      : {
          day_of_week: pickerState.dayOfWeek,
          meal_type: pickerState.mealType,
          recipe_id: recipe.id,
        };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);

      if (!response.ok) {
        const message = payload?.error || payload?.message || "Failed to assign recipe";
        if (response.status === 409) {
          setAssignmentError(message);
          toast.error(message);
        } else {
          throw new Error(message);
        }
        return;
      }

      const entry = payload?.data as
        | { id: string; recipeId: string; notes?: string }
        | undefined;

      setMealPlan((current) => {
        if (!current || !pickerState) {
          return current;
        }

        return {
          ...current,
          days: {
            ...current.days,
            [pickerState.dayOfWeek]: {
              ...current.days[pickerState.dayOfWeek],
              [pickerState.mealType]: {
                entryId: existingSlot?.entryId ?? entry?.id ?? "",
                recipeId: recipe.id,
                title: recipe.title,
                notes: entry?.notes ?? existingSlot?.notes ?? "",
              },
            },
          },
        };
      });

      setPickerState(null);
      setSearchTerm("");
    } catch (error) {
      const message = (error as Error).message || "Failed to assign recipe";
      setAssignmentError(message);
      toast.error(message);
    } finally {
      setAssigningRecipeId(null);
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto pb-4 pr-1">
      <div className="sticky top-0 z-20">
        <div className="rounded-2xl border border-border/50 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 pb-3">
            <span className="text-sm font-semibold text-foreground/70">
              Week of {formatWeekStart(weekStart)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground"
                onClick={() => {
                  const prev = new Date(weekStart);
                  prev.setDate(prev.getDate() - 7);
                  setWeekStart(getMonday(prev));
                }}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground"
                onClick={() => {
                  const next = new Date(weekStart);
                  next.setDate(next.getDate() + 7);
                  setWeekStart(getMonday(next));
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {days.map((day) => (
              <div
                key={day.value}
                className="rounded-2xl border border-border/50 bg-background/60 px-3 py-3 text-center"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
                  {day.shortLabel}
                </div>
                <div className="mt-1 text-base font-semibold text-foreground">
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {MEAL_TYPES.map((mealType) => (
          <div key={mealType.value} className="grid grid-cols-[110px_1fr] gap-4">
            <div className="flex items-center">
              <div className="w-full rounded-2xl border border-border/40 bg-card/60 px-4 py-6 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-accent/80">
                  {mealType.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {days.map((day) => {
                const slot = mealPlan?.days[day.value]?.[mealType.value] ?? null;
                const isActive =
                  pickerState?.dayOfWeek === day.value &&
                  pickerState?.mealType === mealType.value;

                return (
                  <motion.button
                    key={`${day.value}-${mealType.value}`}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setPickerState({ dayOfWeek: day.value, mealType: mealType.value });
                      setAssignmentError(null);
                      setSearchTerm("");
                    }}
                    className={`group flex min-h-32 flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all duration-200 ${
                      isActive
                        ? "border-accent/60 bg-accent/10 shadow-lg shadow-accent/10"
                        : "border-border/50 bg-card/70 hover:border-accent/40 hover:bg-card"
                    }`}
                    disabled={isLoadingPlan}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
                        {day.shortLabel}
                      </span>
                      <span className="rounded-full bg-secondary/70 p-2 text-foreground/55 transition-colors group-hover:text-accent">
                        <Plus size={14} />
                      </span>
                    </div>

                    <div className="w-full">
                      {slot ? (
                        <>
                          <div className="text-sm font-semibold text-foreground">
                            {slot.title}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Click to change recipe
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-foreground/75">
                            Add recipe
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Choose from your saved recipes
                          </div>
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {pickerState ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Select a recipe
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pickerState.dayOfWeek} /{" "}
                  {MEAL_TYPES.find((item) => item.value === pickerState.mealType)?.label}
                  {selectedSlot ? ` / Replacing ${selectedSlot.title}` : ""}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setPickerState(null)}>
                Close
              </Button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search your recipes"
                className="h-12 rounded-2xl pl-11"
              />
            </div>

            {assignmentError ? (
              <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {assignmentError}
              </div>
            ) : null}

            <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
              {isLoadingRecipes ? (
                <div className="rounded-2xl border border-border/50 bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading your recipes...
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  {recipes.length === 0
                    ? "You have no recipes to assign yet."
                    : "No recipes match your search."}
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const isSubmitting = assigningRecipeId === recipe.id;
                  const assignmentCount = assignedRecipeCounts.get(recipe.id) ?? 0;
                  const isOnlyCurrentSlotAssignment =
                    recipe.id === selectedSlot?.recipeId && assignmentCount === 1;
                  const isAssignedThisWeek =
                    assignmentCount > 0 && !isOnlyCurrentSlotAssignment;

                  return (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => void handleAssignRecipe(recipe)}
                      disabled={Boolean(assigningRecipeId)}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background/60 px-4 py-4 text-left transition-colors hover:border-accent/40 hover:bg-accent/5 disabled:cursor-wait disabled:opacity-60"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {recipe.title}
                          </div>
                          {isAssignedThisWeek ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                              <AlertCircle size={12} />
                              Used this week
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {recipe.description}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">
                        {isSubmitting ? "Saving" : "Assign"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
