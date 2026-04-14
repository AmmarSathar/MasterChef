import { useEffect, useMemo, useState } from "react";

import { useUser } from "@/context/UserContext";
import {
  emptyCalendarDay,
  fetchCalendarWeek,
  toSundayIso,
  type CalendarDayData,
} from "@/lib/api/calendar";
import {
  fetchMealPlanWeek,
  toMondayIso,
  type DayName,
  type MealEntry,
  type SlotName,
} from "@/lib/api/meal-plan";
import {
  CalendarDays,
  ChefHat,
  ChevronRight,
  ClipboardList,
  UserRound,
} from "lucide-react";

type DashboardShortcut = {
  title: string;
  description: string;
  hash: "calendar" | "meals" | "recipe" | "settings";
  eyebrow: string;
  cta: string;
  icon: typeof CalendarDays;
};

type RecipePreview = {
  id: string;
  title: string;
  imageUrl?: string;
};

type MealPreview = {
  slot: SlotName;
  meal: MealEntry | null;
};

type CalendarPreviewMeal = {
  slot: SlotName;
  meal: CalendarDayData[SlotName] | null;
};

type WeekDayPreview = {
  day: DayName;
  meals: CalendarPreviewMeal[];
};

const DAY_ORDER: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const dashboardShortcuts: DashboardShortcut[] = [
  {
    title: "Weekly curations",
    description:
      "Check the calendar view to organize the week and spot empty meal slots quickly.",
    hash: "calendar",
    eyebrow: "Plan",
    cta: "Open calendar",
    icon: CalendarDays,
  },
  {
    title: "Meals board",
    description:
      "Manage breakfast, lunch, and dinner entries with drag-and-drop meal planning.",
    hash: "meals",
    eyebrow: "Organize",
    cta: "Review meals",
    icon: ClipboardList,
  },
  {
    title: "Recipe studio",
    description:
      "Create, edit, and import recipes so your collection stays ready for planning.",
    hash: "recipe",
    eyebrow: "Create",
    cta: "Go to recipes",
    icon: ChefHat,
  },
];

function getGreeting(date: Date) {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatSkillLevel(skillLevel?: string) {
  if (!skillLevel) return "Still setting up";

  return skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

function navigateTo(hash: DashboardShortcut["hash"]) {
  window.location.hash = hash;
}

function shuffleRecipes(recipes: RecipePreview[]) {
  const shuffled = [...recipes];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function buildRecipePreviewSlots(recipes: RecipePreview[]) {
  const slots: Array<RecipePreview | null> = [...recipes.slice(0, 3)];
  while (slots.length < 3) {
    slots.push(null);
  }
  return slots;
}

function getCurrentDayName(date: Date): DayName {
  const daysByIndex: DayName[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as DayName[];

  return daysByIndex[date.getDay()];
}

function buildMealPreview(dayMeals: Record<SlotName, MealEntry[]> | undefined) {
  const slots: SlotName[] = ["breakfast", "lunch", "dinner"];
  return slots.map((slot) => ({
    slot,
    meal: dayMeals?.[slot]?.[0] ?? null,
  }));
}

function buildCalendarPreview(dayMeals: CalendarDayData | undefined) {
  const slots: SlotName[] = ["breakfast", "lunch", "dinner"];
  const resolvedMeals = dayMeals ?? emptyCalendarDay();

  return slots.map((slot) => ({
    slot,
    meal: resolvedMeals[slot] ?? null,
  }));
}

function toDateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMealSlot(slot: SlotName) {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function formatDayLabel(day: DayName) {
  return day.slice(0, 3);
}

function formatList(values?: string[]) {
  if (!values || values.length === 0) return "None added";
  return values.join(", ");
}

function formatWeekLabel(mondayIso: string) {
  const start = new Date(`${mondayIso}T00:00:00`);

  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `Week of ${startLabel}`;
}

export function MainDashboardTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Dashboard</h1>;
}

export function MainDashboardContent() {
  const { user } = useUser();
  const [recipePreview, setRecipePreview] = useState<RecipePreview[]>([]);
  const [mealPreview, setMealPreview] = useState<MealPreview[]>([]);
  const [weekPreview, setWeekPreview] = useState<WeekDayPreview[]>([]);
  const [currentWeekLabel, setCurrentWeekLabel] = useState("");

  const greeting = useMemo(() => getGreeting(new Date()), []);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Chef";
  const currentDayName = useMemo(() => getCurrentDayName(new Date()), []);
  const skillLevel = formatSkillLevel(user?.skill_level);
  const cuisinesLabel = formatList(user?.cuisines_pref);
  const allergiesLabel = formatList(user?.allergies);
  const dietaryLabel = formatList(user?.dietary_restric);
  const recipePreviewSlots = useMemo(
    () => buildRecipePreviewSlots(recipePreview),
    [recipePreview],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRecipePreview() {
      if (!user?.id) {
        setRecipePreview([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set("createdBy", user.id);

        const response = await fetch(`/api/recipes?${params.toString()}`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.message || "Failed to load recipes");
        }

        const recipes = Array.isArray(json?.data?.recipes)
          ? (json.data.recipes as RecipePreview[])
          : [];

        if (!cancelled) {
          setRecipePreview(shuffleRecipes(recipes).slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setRecipePreview([]);
        }
      }
    }

    void loadRecipePreview();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadMealPreview() {
      try {
        const mondayIso = toMondayIso(new Date());
        const week = await fetchMealPlanWeek(mondayIso);
        const today = getCurrentDayName(new Date());
        const preview = buildMealPreview(week.days[today]);

        if (!cancelled) {
          setMealPreview(preview);
        }
      } catch {
        if (!cancelled) {
          setMealPreview([]);
        }
      }
    }

    void loadMealPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeekPreview() {
      try {
        const today = new Date();
        const sundayIso = toSundayIso(today);
        const week = await fetchCalendarWeek(sundayIso);
        const weekStart = new Date(`${sundayIso}T00:00:00`);
        const weeklyPreview = DAY_ORDER.map((day, index) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + index + 1);
          const dateKey = toDateKey(date);

          return {
            day,
            meals: buildCalendarPreview(week.days[dateKey]),
          };
        });

        if (!cancelled) {
          setWeekPreview(weeklyPreview);
          setCurrentWeekLabel(formatWeekLabel(toMondayIso(today)));
        }
      } catch {
        if (!cancelled) {
          setWeekPreview([]);
          setCurrentWeekLabel("");
        }
      }
    }

    void loadWeekPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard-content flex h-full w-full flex-col gap-4 overflow-y-auto pb-4 pr-1 xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="rounded-3xl border border-border/60 bg-linear-to-br from-card/95 via-card/80 to-primary/20 p-6 shadow-sm shadow-border/20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {greeting}, {firstName}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {dashboardShortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <button
                key={shortcut.hash}
                type="button"
                onClick={() => navigateTo(shortcut.hash)}
                className={`group rounded-3xl border border-border/50 bg-card/70 p-5 text-left shadow-sm shadow-border/10 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-card ${
                  shortcut.hash === "calendar"
                    ? "lg:col-span-2"
                    : shortcut.hash === "recipe"
                      ? "lg:order-1"
                      : shortcut.hash === "meals"
                        ? "lg:order-2"
                        : ""
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-accent">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {shortcut.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-secondary/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                    {shortcut.eyebrow}
                  </span>
                </div>
                {shortcut.hash === "recipe" && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {recipePreviewSlots.map((recipe, index) => (
                      <div
                        key={recipe?.id ?? `recipe-placeholder-${index}`}
                        className="overflow-hidden rounded-2xl border border-border/50 bg-background/55"
                      >
                        <div className="aspect-square bg-secondary/50">
                          {recipe?.imageUrl ? (
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-secondary/60" />
                          )}
                        </div>
                        <div className="px-2 py-2">
                          <p className="line-clamp-2 text-[0.72rem] font-semibold leading-4 text-foreground/80">
                            {recipe?.title ?? ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {shortcut.hash === "calendar" && (
                  <div className="mt-4">
                    {currentWeekLabel && (
                      <p className="mb-3 px-1 text-sm font-semibold text-foreground/60">
                        {currentWeekLabel}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
                      {weekPreview.map(({ day, meals }) => (
                        <div
                          key={day}
                          className="rounded-2xl border border-border/40 bg-background/35 px-3 py-2.5"
                        >
                          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">
                            {formatDayLabel(day)}
                          </p>
                          <div className="flex min-h-[5.3rem] items-center justify-center">
                            <div className="relative h-[4.9rem] w-[6.2rem] overflow-visible">
                            {meals.map(({ slot, meal }, index) => (
                              <div
                                key={slot}
                                className="absolute top-1/2 w-[3.35rem] -translate-y-1/2 overflow-hidden rounded-xl border border-border/50 bg-secondary/50 shadow-sm"
                                style={{
                                  left: `${index * 1.1}rem`,
                                  transform: `rotate(${index === 0 ? -6 : index === 1 ? -1 : 5}deg)`,
                                  zIndex: index + 1,
                                }}
                              >
                                <div className="aspect-square bg-secondary/60">
                                  {meal?.imageUrl ? (
                                    <img
                                      src={meal.imageUrl}
                                      alt={`${day} ${formatMealSlot(slot)} ${meal.title}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-secondary/60" />
                                  )}
                                </div>
                              </div>
                            ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {shortcut.hash === "meals" && (
                  <p className="mt-4 px-1 text-sm font-semibold text-foreground/60">
                    Today: {currentDayName}
                  </p>
                )}
                {shortcut.hash === "meals" && mealPreview.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {mealPreview.map(({ slot, meal }) => (
                      <div key={slot} className="flex flex-col gap-1.5">
                        <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">
                          {formatMealSlot(slot)}
                        </p>
                        <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/55">
                          <div className="aspect-square bg-secondary/50">
                          {meal?.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt={meal.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-secondary/60" />
                          )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {shortcut.hash === "meals" && mealPreview.length === 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["breakfast", "lunch", "dinner"] as SlotName[]).map(
                      (slot) => (
                        <div key={slot} className="flex flex-col gap-1.5">
                          <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/60">
                            {formatMealSlot(slot)}
                          </p>
                          <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/55">
                            <div className="aspect-square bg-secondary/60" />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
                <p className="mt-3 text-sm leading-6 text-foreground/65">
                  {shortcut.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent transition-transform duration-300 group-hover:translate-x-1">
                  {shortcut.cta}
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="flex min-w-0 flex-col gap-4">
        <div className="rounded-3xl border border-border/50 bg-card/75 p-5 shadow-sm shadow-border/10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-secondary/60">
              {user?.pfp ? (
                <img
                  src={user.pfp}
                  alt={`${user.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={24} className="text-foreground/55" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cooking profile
              </p>
              <h3 className="truncate text-xl font-semibold text-foreground">
                {user?.name || "Guest user"}
              </h3>
              <p className="text-sm text-foreground/60">
                {user?.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Dietary tags
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {dietaryLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Skill
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {skillLevel}
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Cuisines
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {cuisinesLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Allergies
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {allergiesLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Bio
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {user?.bio?.trim() ||
                    "Add a short bio in settings so the profile card feels complete."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
