import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CalendarDayView } from "./calendar/CalendarDayView";
import CalendarWeekView, { CalendarWeekViewSkeleton } from "./calendar/CalendarWeekView";
import { CalendarPicker } from "./calendar/CalendarPicker";
import RecipeCreator from "@/components/ui/RecipeCreator";
import RecipeView from "@/components/ui/RecipeView";
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { DAYS_OF_WEEK, MONTH_NAMES } from "@masterchef/shared/constants";
import { emptyCalendarDay, fetchCalendarWeek, toSundayIso } from "@/lib/api/calendar";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { type Recipe } from "@masterchef/shared/types";
import { type CalendarDayData, type CalendarSlotEntry } from "@/lib/api/calendar";

const RECIPES_API_BASE = "/api/recipes";

type TimeFilter = "weekly" | "monthly" | "yearly";
type ViewMode = "calendar" | "day";

const TIME_FILTERS: TimeFilter[] = ["weekly", "monthly", "yearly"];

const _dayLabels = DAYS_OF_WEEK.map((d) => d.label.slice(0, 3));
const WEEKDAY_SHORT = [_dayLabels[6], ..._dayLabels.slice(0, 6)];

const toDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getWeekDates = (baseDate: Date): Date[] => {
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - baseDate.getDay()); // roll back to Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const getMonthGridDates = (baseDate: Date): Date[] => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay();

  const dates: Date[] = [];
  for (let i = 0; i < leading; i++)
    dates.push(new Date(year, month, -leading + i + 1));
  for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
  while (dates.length < 42)
    dates.push(
      new Date(year, month + 1, dates.length - (leading + daysInMonth) + 1),
    );
  return dates;
};

const getYearDates = (baseDate: Date): Date[] =>
  Array.from({ length: 12 }, (_, i) => new Date(baseDate.getFullYear(), i, 1));

const DAYNAME_BY_GETDAY: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const toEntry = (
  days: Record<string, Record<string, CalendarSlotEntry[]>>,
  date: Date,
): CalendarDayData => {
  const dayName = DAYNAME_BY_GETDAY[date.getDay()];
  const daySlots = days[dayName];
  return {
    breakfast: (daySlots?.breakfast?.[0] as CalendarSlotEntry) ?? null,
    lunch: (daySlots?.lunch?.[0] as CalendarSlotEntry) ?? null,
    dinner: (daySlots?.dinner?.[0] as CalendarSlotEntry) ?? null,
  };
};

const yearVariants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 24, opacity: 0 }),
};

export function CalendarTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Weekly Curations</h1>;
}

function CalendarRecipeViewer({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const { user } = useUser();

  return (
    <RecipeView
      recipe={recipe}
      isOwner={!!user && recipe.createdBy === user.id}
      onClose={onClose}
      onEdit={() => {
        onClose();
        window.location.hash = `recipe?edit=${recipe.id}`;
      }}
      onDelete={() => {
        onClose();
        window.location.hash = `recipe?view=${recipe.id}`;
      }}
    />
  );
}

export function CalendarContent() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTimeFilter, setActiveTimeFilter] =
    useState<TimeFilter>("weekly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState<
    Record<string, CalendarDayData>
  >({});
  const [loading, setLoading] = useState(false);
  const [yearDir, setYearDir] = useState(0);
  const [viewedRecipe, setViewedRecipe] = useState<Recipe | null>(null);
  const [loadingMealId, setLoadingMealId] = useState<string | null>(null);

  const handleMealClick = async (meal: CalendarSlotEntry) => {
    setLoadingMealId(meal.recipeId);
    try {
      const res = await fetch(
        `${RECIPES_API_BASE}/${encodeURIComponent(meal.recipeId)}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Failed to load recipe");
      setViewedRecipe(json.data as Recipe);
    } catch (err) {
      console.error("[Calendar] Failed to fetch recipe:", err);
    } finally {
      setLoadingMealId(null);
    }
  };

  useEffect(() => {
    if (viewMode === "day") return;

    setLoading(true);

    if (activeTimeFilter === "monthly") {
      const monthDates = getMonthGridDates(selectedDate);
      const uniqueSundays = [...new Set(monthDates.map((d) => toSundayIso(d)))];

      Promise.all(uniqueSundays.map((sunday) => fetchCalendarWeek(sunday)))
        .then((results) => {
          setCalendarDays((prev) => {
            const next = { ...prev };
            for (const data of results) {
              Object.assign(next, data.days);
            }
            return next;
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }

    fetchCalendarWeek(toSundayIso(selectedDate))
      .then((data) => {
        setCalendarDays(data.days);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate, activeTimeFilter, viewMode]);

  const displayedDates = useMemo(() => {
    if (activeTimeFilter === "weekly") return getWeekDates(selectedDate);
    if (activeTimeFilter === "monthly") return getMonthGridDates(selectedDate);
    return getYearDates(selectedDate);
  }, [activeTimeFilter, selectedDate]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const selectedKey = toDateKey(selectedDate);
  const selectedMeals = calendarDays[selectedKey] ?? emptyCalendarDay();
  const weeklyLabel = `${MONTH_NAMES[weekDates[0].getMonth()]} ${weekDates[0].getDate()} - ${weekDates[6].getDate()}, ${weekDates[6].getFullYear()}`;

  const changeYear = (dir: 1 | -1) => {
    setYearDir(dir);
    if (activeTimeFilter === "monthly") {
      setSelectedDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + dir, 1),
      );
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear() + dir, 0, 1));
    }
  };

  return (
    <div className="calendar-root w-full h-full text-foreground bg-background rounded-2xl p-6">
      <AnimatePresence>
        {viewMode === "calendar" ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="calendar-view w-full h-full flex gap-6"
          >
            <section className="calendar-main flex-1 min-w-0">
              <div className="calendar-header flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-5xl font-semibold tracking-tight">
                    Weekly Curations
                  </h2>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Week of {weeklyLabel}
                  </p>
                </div>
                <div className="filter-tabs bg-card rounded-xl p-1 flex gap-1">
                  {TIME_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveTimeFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-xs uppercase tracking-[0.15em] transition ${
                        activeTimeFilter === filter
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTimeFilter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {activeTimeFilter === "weekly" ? (
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="week-skeleton"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CalendarWeekViewSkeleton />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="week-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CalendarWeekView
                            dates={displayedDates}
                            selectionsByDay={calendarDays}
                            onDayClick={(date) => {
                              setSelectedDate(date);
                              setViewMode("day");
                            }}
                            onMealClick={handleMealClick}
                            loadingMealId={loadingMealId}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <>
                      <div className="date-selector absolute flex items-center gap-3 mb-4 right-0 -top-11">
                        <button
                          onClick={() => changeYear(-1)}
                          className="p-2 rounded hover:bg-secondary transition text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft
                            className="pointer-events-none"
                            size={16}
                          />
                        </button>
                        <div className="w-30 text-center overflow-hidden">
                          <AnimatePresence mode="wait" custom={yearDir}>
                            <motion.span
                              key={
                                activeTimeFilter === "monthly"
                                  ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`
                                  : selectedDate.getFullYear()
                              }
                              custom={yearDir}
                              variants={yearVariants}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={{ duration: 0.15 }}
                              className="text-xl font-semibold block"
                            >
                              {activeTimeFilter === "monthly"
                                ? `${MONTH_NAMES[selectedDate.getMonth()]}`
                                : selectedDate.getFullYear()}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <button
                          onClick={() => changeYear(1)}
                          className="p-2 rounded hover:bg-secondary transition text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight
                            className="pointer-events-none"
                            size={16}
                          />
                        </button>
                      </div>
                      <div
                        className={`period-grid grid gap-3 ${activeTimeFilter === "monthly" ? "grid-cols-7" : "grid-cols-4"}`}
                      >
                        {displayedDates.map((date) => {
                          const dateKey = toDateKey(date);
                          const dayData =
                            activeTimeFilter === "monthly"
                              ? (calendarDays[dateKey] ?? emptyCalendarDay())
                              : null;
                          const meals = dayData
                            ? [
                                dayData.breakfast,
                                dayData.lunch,
                                dayData.dinner,
                              ].filter(
                                (m): m is CalendarSlotEntry => m !== null,
                              )
                            : [];
                          const MAX_VISIBLE = 4;
                          const visibleMeals = meals.slice(0, MAX_VISIBLE);
                          const overflow = meals.length - MAX_VISIBLE;

                          return (
                            <div
                              key={`${activeTimeFilter}-${dateKey}`}
                              onClick={() => {
                                setSelectedDate(date);
                                setActiveTimeFilter(
                                  activeTimeFilter === "yearly"
                                    ? "monthly"
                                    : "weekly",
                                );
                              }}
                              className={`flex items-start flex-col bg-card rounded-xl border border-border p-3 min-h-30 cursor-pointer hover:bg-secondary transition ${date.getMonth() !== selectedDate.getMonth() ? "opacity-70 bg-card/50" : ""}`}
                            >
                              <p className="text-xs scale-95 text-left text-muted-foreground pointer-events-none">
                                {activeTimeFilter === "monthly"
                                  ? WEEKDAY_SHORT[date.getDay()]
                                  : MONTH_NAMES[date.getMonth()]}
                              </p>
                              <p className="text-2xl font-semibold mt-1 pointer-events-none">
                                {activeTimeFilter === "yearly"
                                  ? date.getFullYear()
                                  : date.getDate()}
                              </p>
                              {visibleMeals.length > 0 && (
                                <AvatarGroup className="mt-auto pt-2 pointer-events-none">
                                  {visibleMeals.map((meal) => (
                                    <Avatar key={meal.recipeId} size="sm">
                                      <AvatarImage
                                        src={meal.imageUrl}
                                        alt={meal.title}
                                      />
                                      <AvatarFallback className="text-[10px]">
                                        {meal.title.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {overflow > 0 && (
                                    <AvatarGroupCount className="text-[10px]">
                                      +{overflow}
                                    </AvatarGroupCount>
                                  )}
                                </AvatarGroup>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

            <aside className="calendar-sidebar w-80 shrink-0 space-y-4">
              <CalendarPicker
                onDaySelect={(day) => {
                  setSelectedDate(day);
                  setActiveTimeFilter("weekly");
                }}
              />

              <div className="nutrition-card bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm uppercase tracking-[0.2em] text-accent mb-3">
                  Nutritional Overview
                </h3>
                <div className="flex items-end justify-between">
                  <p className="text-muted-foreground text-sm">
                    Avg. Daily Calories
                  </p>
                  <p className="text-3xl font-semibold">
                    — <span className="text-lg">kcal</span>
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
                  <div className="h-full w-0 bg-accent" />
                </div>
                <div className="macro-breakdown grid grid-cols-3 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Protein
                    </p>
                    <p>—</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Carbs
                    </p>
                    <p>—</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Fat
                    </p>
                    <p>—</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCreatorOpen(true)}
                className="w-full rounded-xl border border-border py-3 text-sm uppercase tracking-[0.15em] hover:bg-secondary transition"
              >
                Export Weekly Plan
              </button>
            </aside>
          </motion.div>
        ) : (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full overflow-hidden relative flex"
          >
            <CalendarDayView
              date={selectedDate}
              meals={selectedMeals}
              onBack={() => setViewMode("calendar")}
              onNewRecipe={() => setCreatorOpen(true)}
              onMealsChange={(updatedMeals) =>
                setCalendarDays((prev) => ({
                  ...prev,
                  [selectedKey]: updatedMeals,
                }))
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creatorOpen && (
          <RecipeCreator
            onClose={() => setCreatorOpen(false)}
            onFinish={() => setCreatorOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewedRecipe && (
          <CalendarRecipeViewer
            key={viewedRecipe.id}
            recipe={viewedRecipe}
            onClose={() => setViewedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
