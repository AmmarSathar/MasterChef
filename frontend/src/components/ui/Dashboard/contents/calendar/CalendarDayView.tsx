import { useState, useEffect } from "react";
import { ArrowLeft, Check, CookieIcon, Plus } from "lucide-react";
import {
  DAYS_OF_WEEK,
  MEAL_TYPES,
  MONTH_NAMES,
} from "@masterchef/shared/constants";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assignCalendarEntry,
  fetchCalendarWeek,
  toSundayIso,
  type CalendarMealType,
  type CalendarDayData,
  type CalendarSlotEntry,
} from "@/lib/api/calendar";
import {
  fetchMealPlanWeek,
  toMondayIso,
  type MealEntry,
  type SlotName,
  type DayName,
} from "@/lib/api/meal-plan";

export type MealSlot = CalendarMealType;

export type MealPrepOption = CalendarSlotEntry;

const _dayLabels = DAYS_OF_WEEK.map((d) => d.label.slice(0, 3));
const WEEKDAY_SHORT = [_dayLabels[6], ..._dayLabels.slice(0, 6)];

export const MEAL_SLOTS = MEAL_TYPES.filter((m) => m.value !== "snack").map(
  (m) => m.value,
) as MealSlot[];

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Morning Selection",
  lunch: "Midday Options",
  dinner: "Supper Selections",
};

const DAY_NAMES: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

interface Props {
  date: Date;
  meals: CalendarDayData;
  onBack: () => void;
  onNewRecipe: () => void;
  onMealsChange: (meals: CalendarDayData) => void;
}

export function CalendarDayView({
  date,
  meals,
  onBack,
  onNewRecipe,
  onMealsChange,
}: Props) {
  const { user } = useUser();
  const dateStr = toDateStr(date);
  const dayName = DAY_NAMES[date.getDay()];

  const [slotEntries, setSlotEntries] = useState<Record<SlotName, MealEntry[]>>(
    {
      breakfast: [],
      lunch: [],
      dinner: [],
    },
  );
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [warningSlot, setWarningSlot] = useState<MealSlot | null>(null);
  const [assignedRecipeIds, setAssignedRecipeIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!user?.id) return;
    setLoadingMeals(true);
    fetchMealPlanWeek(toMondayIso(date))
      .then((data) => {
        const day = data.days[dayName];
        setSlotEntries({
          breakfast: day?.breakfast ?? [],
          lunch: day?.lunch ?? [],
          dinner: day?.dinner ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoadingMeals(false));
  }, [user, dateStr, date, dayName]);

  useEffect(() => {
    if (!user?.id) return;

    fetchCalendarWeek(toSundayIso(date))
      .then((data) => {
        const weeklyRecipeIds = new Set<string>();

        Object.values(data.days).forEach((day) => {
          Object.values(day).forEach((meal) => {
            if (meal?.recipeId) {
              weeklyRecipeIds.add(meal.recipeId);
            }
          });
        });

        Object.values(meals).forEach((meal) => {
          if (meal?.recipeId) {
            weeklyRecipeIds.add(meal.recipeId);
          }
        });

        setAssignedRecipeIds(weeklyRecipeIds);
      })
      .catch(console.error);
  }, [user?.id, date, meals]);

  const handleChoose = async (slot: MealSlot, entry: MealEntry) => {
    const result = await assignCalendarEntry(dateStr, slot, entry.recipeId);
    onMealsChange({ ...meals, [slot]: result });
  };

  return (
    <motion.div className="day-view w-full h-full flex gap-6 relative">
      <section className="day-main w-full h-full flex flex-col relative">
        <div className="day-header flex items-start justify-between gap-3 mb-6 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {WEEKDAY_SHORT[date.getDay()]}
            </p>
            <h2 className="text-5xl font-semibold tracking-tight">
              {MONTH_NAMES[date.getMonth()]} {date.getDate()},{" "}
              {date.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="rounded-xl border border-border px-4 py-2 text-sm flex items-center gap-2 hover:bg-secondary transition"
            >
              <ArrowLeft className="pointer-events-none" size={14} /> Back
            </button>
            <button
              onClick={onNewRecipe}
              className="rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm hover:opacity-90 transition"
            >
              + New Recipe
            </button>
          </div>
        </div>

        <div className="meal-plan-choices flex flex-col gap-6 overflow-y-scroll pr-1 h-full w-full relative">
          <AnimatePresence mode="wait">
            {loadingMeals ? (
              <motion.div
                key="day-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {MEAL_SLOTS.map((slot) => (
                  <div className="meal-section" key={slot}>
                    <div className="h-8 w-44 rounded-lg bg-muted/90 animate-pulse mb-3" />
                    <div className="grid grid-cols-3 gap-3 pr-15">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-xl h-44 bg-muted/90 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="day-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {MEAL_SLOTS.map((slot) => {
                  const entries = slotEntries[slot as SlotName];
                  const active = meals[slot];

                  return (
                    <div className="meal-section" key={slot}>
                      <h3 className="meal-plan-label text-2xl italic mb-3 text-foreground/90">
                        {SLOT_LABELS[slot]}
                      </h3>
                      <div className="meal-options grid grid-cols-3 gap-3">
                        {entries.map((entry) => {
                          const isActive = active?.recipeId === entry.recipeId;
                          const isAssignedThisWeek = assignedRecipeIds.has(
                            entry.recipeId,
                          );
                          return (
                            <button
                              key={entry.entryId}
                              onClick={() => handleChoose(slot, entry)}
                              className={`rounded-xl overflow-hidden text-left border transition cursor-pointer ${
                                isActive
                                  ? "border-accent ring-2 ring-accent/50"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              <div className="option-card h-44 relative pointer-events-none">
                                {entry.imageUrl ? (
                                  <img
                                    src={entry.imageUrl ?? ""}
                                    alt={entry.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-card/50 flex items-center justify-center">
                                    <CookieIcon
                                      size={32}
                                      className="text-foreground/20"
                                    />
                                  </div>
                                )}
                                {isAssignedThisWeek && (
                                  <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white shadow-sm">
                                    <Check size={12} />
                                    This Week
                                  </Badge>
                                )}
                                <div className="option-overlay absolute inset-0 bg-linear-to-t from-black/85 to-transparent p-3 flex flex-col justify-end">
                                  <p className="text-xs scale-95 -ml-1 uppercase tracking-[0.2em] text-accent">
                                    {entry.cookingTime ?? 0} mins
                                  </p>
                                  <p className="font-semibold leading-tight">
                                    {entry.title}
                                  </p>
                                  <span className="mt-2 text-xs scale-95 -ml-1 uppercase tracking-[0.2em] bg-accent text-accent-foreground rounded px-2 py-1 w-fit">
                                    {!isActive ? "Select Choice" : "Selected"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {entries.length < 3 && (
                          <button
                            onClick={() => setWarningSlot(slot)}
                            className="rounded-xl h-44 border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-accent/50 transition cursor-pointer"
                          >
                            <Plus size={20} className="pointer-events-none" />
                            <span className="text-xs uppercase tracking-[0.15em] pointer-events-none">
                              Add Meal
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <aside className="day-sidebar w-80 shrink-0 space-y-4">
        <div className="nutrition-target bg-card border border-border rounded-2xl p-4">
          <h3 className="text-xs uppercase tracking-[0.24em] text-accent">
            Nutritional Target
          </h3>
          <div className="calorie-ring mt-4 w-44 h-44 mx-auto rounded-full border-10 border-secondary border-t-accent flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-semibold">1,840</p>
              <p className="text-xs uppercase text-muted-foreground">
                kcal left
              </p>
            </div>
          </div>
          <div className="macro-summary grid grid-cols-3 mt-3 text-center text-sm">
            <div>
              <p className="text-xs scale-95 -ml-1 uppercase text-muted-foreground">
                Pro
              </p>
              <p>42g</p>
            </div>
            <div>
              <p className="text-xs scale-95 -ml-1 uppercase text-muted-foreground">
                Carb
              </p>
              <p>120g</p>
            </div>
            <div>
              <p className="text-xs scale-95 -ml-1 uppercase text-muted-foreground">
                Fat
              </p>
              <p>35g</p>
            </div>
          </div>
        </div>

        <div className="activity-log bg-card border border-border rounded-2xl p-4">
          <h3 className="text-xs uppercase tracking-[0.24em] text-accent mb-2">
            Timeline Activity
          </h3>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>07:30 AM - Morning Ritual Coffee</li>
            <li className="text-muted-foreground">
              12:30 PM - Waiting for selection...
            </li>
          </ul>
        </div>

        <div className="market-card bg-linear-to-br from-primary to-primary/70 rounded-2xl p-4 text-primary-foreground">
          <p className="text-lg font-semibold">Your Market List is ready</p>
          <p className="text-sm opacity-85">
            12 items pending for today's recipes
          </p>
          <button className="mt-3 text-xs uppercase tracking-[0.2em] underline">
            View Grocery List
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {warningSlot && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)", y: 0 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", y: 2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
              <h4 className="text-base font-semibold text-accent/90">
                Add Meal
              </h4>
              <p className="mt-2 text-sm text-foreground/75">
                This will redirect you to the meal prep page where you can add a
                meal to this slot.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setWarningSlot(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    window.location.hash = `meals?date=${dateStr}&slot=${warningSlot}`;
                    setWarningSlot(null);
                  }}
                >
                  Go to Meal Prep
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
