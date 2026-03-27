import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CalendarPicker } from "@/components/ui/Dashboard/CalendarPicker";
import {
  CalendarDayView,
  MEAL_SLOTS,
  type MealSlot,
  type MealPrepOption,
} from "./CalendarDayView";
import RecipeCreator from "@/components/ui/RecipeCreator";
import {
  DAYS_OF_WEEK,
  MONTH_NAMES,
} from "@masterchef/shared/constants/";

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
  start.setDate(baseDate.getDate() - baseDate.getDay());
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

const yearVariants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 24, opacity: 0 }),
};

export function CalendarTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Weekly Curations</h1>;
}

export function CalendarContent() {
  const [activeTimeFilter, setActiveTimeFilter] =
    useState<TimeFilter>("weekly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [selectionsByDay, setSelectionsByDay] = useState<
    Record<string, Partial<Record<MealSlot, MealPrepOption>>>
  >({});
  const [yearDir, setYearDir] = useState(0);

  const displayedDates = useMemo(() => {
    if (activeTimeFilter === "weekly") return getWeekDates(selectedDate);
    if (activeTimeFilter === "monthly") return getMonthGridDates(selectedDate);
    return getYearDates(selectedDate);
  }, [activeTimeFilter, selectedDate]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const selectedKey = toDateKey(selectedDate);
  const selectedMeals = selectionsByDay[selectedKey] ?? {};
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

  const chooseMeal = (slot: MealSlot, option: MealPrepOption) => {
    setSelectionsByDay((prev) => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [slot]: option },
    }));
  };

  return (
    <div className="w-full h-full text-foreground bg-background rounded-2xl p-6">
      <AnimatePresence>
        {viewMode === "calendar" ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex gap-6"
          >
            <section className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-5xl font-semibold tracking-tight">
                    Weekly Curations
                  </h2>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Week of {weeklyLabel}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-1 flex gap-1">
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
                    <div className="grid grid-cols-7 gap-3">
                      {displayedDates.map((date) => {
                        const key = toDateKey(date);
                        const dayMeals = selectionsByDay[key] ?? {};
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setSelectedDate(date);
                              setViewMode("day");
                            }}
                            className="cursor-pointer"
                          >
                            <div className="mb-2 text-center">
                              <p className="text-xs scale-95 -ml-1 uppercase tracking-[0.22em] text-muted-foreground">
                                {WEEKDAY_SHORT[date.getDay()]}
                              </p>
                              <p className="text-2xl font-semibold">
                                {date.getDate()}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {MEAL_SLOTS.map((slot) => {
                                const meal = dayMeals[slot];
                                return meal ? (
                                  <div
                                    key={slot}
                                    className="h-28 rounded-xl overflow-hidden relative"
                                  >
                                    <img
                                      src={meal.imageUrl}
                                      alt={meal.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/85 to-transparent p-2 flex flex-col justify-end">
                                      <span className="text-[9px] uppercase tracking-[0.2em] text-accent">
                                        {slot}
                                      </span>
                                      <span className="text-xs leading-tight font-medium">
                                        {meal.title}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={slot}
                                    className="h-28 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/70 transition duration-300"
                                  >
                                    <Plus
                                      size={16}
                                      className="text-muted-foreground pointer-events-none"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                        className={`grid gap-3 ${activeTimeFilter === "monthly" ? "grid-cols-7" : "grid-cols-4"}`}
                      >
                        {displayedDates.map((date) => (
                          <div
                            key={`${activeTimeFilter}-${toDateKey(date)}`}
                            onClick={() => {
                              setSelectedDate(date);
                              setActiveTimeFilter(
                                activeTimeFilter === "yearly"
                                  ? "monthly"
                                  : "weekly",
                              );
                            }}
                            className={`flex items-baseline justify-baseline flex-col bg-card rounded-xl border border-border p-3 min-h-30 cursor-pointer hover:bg-secondary transition ${date.getMonth() !== selectedDate.getMonth() ? "opacity-70 bg-card/50" : ""}`}
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
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

            <aside className="w-[320px] shrink-0 space-y-4">
              <CalendarPicker
                onDaySelect={(day) => {
                  setSelectedDate(day);
                  setActiveTimeFilter("weekly");
                }}
              />

              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm uppercase tracking-[0.2em] text-accent mb-3">
                  Nutritional Overview
                </h3>
                <div className="flex items-end justify-between">
                  <p className="text-muted-foreground text-sm">
                    Avg. Daily Calories
                  </p>
                  <p className="text-3xl font-semibold">
                    1,850 <span className="text-lg">kcal</span>
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
                  <div className="h-full w-2/3 bg-accent" />
                </div>
                <div className="grid grid-cols-3 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs scale-95 -ml-1 uppercase">
                      Protein
                    </p>
                    <p>140g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs scale-95 -ml-1 uppercase">
                      Carbs
                    </p>
                    <p>185g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs scale-95 -ml-1 uppercase">
                      Fat
                    </p>
                    <p>65g</p>
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
          >
            <CalendarDayView
              date={selectedDate}
              meals={selectedMeals}
              onBack={() => setViewMode("calendar")}
              onNewRecipe={() => setCreatorOpen(true)}
              onChooseMeal={chooseMeal}
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
    </div>
  );
}
