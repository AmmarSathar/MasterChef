import { useState, useEffect, useMemo, ReactElement } from "react";
import { useUser } from "@context/UserContext";
import type { DayOfWeek, MealType } from "@masterchef/shared/constants";
import { Recipe } from "@masterchef/shared";
import { AnimatePresence } from "framer-motion";
import RecipeView from "@/components/ui/RecipeView";
import RecipeCreator from "@/components/ui/RecipeCreator";

import {
  Share2,
  ListOrdered,
  Plus,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Utensils,
  Pizza,
} from "lucide-react";

// Constants
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MEAL_PLANS_API_BASE = "/api/meal-plans";
const TIME_FILTERS = ["weekly", "monthly", "yearly"] as const;
const CALENDAR_GRID_SIZE = 42;
const MONTHS_IN_YEAR = 12;

// Utility function
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

// Meal type styling constants
const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: "bg-orange-500/20 text-orange-600",
  lunch: "bg-green-500/20 text-green-600",
  dinner: "bg-purple-500/20 text-purple-600",
  snack: "bg-yellow-500/20 text-yellow-600",
};

const MEAL_ICONS: Record<MealType, ReactElement> = {
  breakfast: <Coffee size={12} className="pointer-events-none" />,
  lunch: <Utensils size={12} className="pointer-events-none" />,
  dinner: <Utensils size={12} className="pointer-events-none" />,
  snack: <Pizza size={12} className="pointer-events-none" />,
};

const ACTION_BUTTONS = [
  {
    icon: <Share2 size={16} className="pointer-events-none" />,
    label: "Share",
  },
  {
    icon: <ListOrdered size={16} className="pointer-events-none" />,
    label: "Re-Organize",
  },
  {
    icon: <Plus size={16} className="pointer-events-none" />,
    label: "New",
  },
] as const;

// Types
interface Meal {
  id: string;
  name: string;
  image: string;
  type: MealType;
}

interface DayMeals {
  date: Date;
  meals: Meal[];
}

interface MealPlanResponse {
  id: string;
  weekStartDate: Date;
  days: Record<DayOfWeek, Record<MealType, { recipeId: string; title: string; notes: string } | null>>;
}

// Skeleton Component
const CalendarSkeleton = ({ activeTimeFilter }: { activeTimeFilter: "weekly" | "monthly" | "yearly" }) => {
  const getSkeletonCount = () => {
    if (activeTimeFilter === "weekly") return WEEK_DAYS.length;
    if (activeTimeFilter === "monthly") return CALENDAR_GRID_SIZE;
    return MONTHS_IN_YEAR;
  };

  return (
    <>
      {Array.from({ length: getSkeletonCount() }).map((_, index) => (
        <div
          key={index}
          className={`calendar-day-skeleton flex flex-col ${
            activeTimeFilter === "monthly" ? "gap-2" : "gap-3"
          } bg-secondary/30 rounded-lg p-3 animate-pulse ${
            activeTimeFilter !== "monthly" ? "min-h-50" : ""
          }`}
        >
          <div
            className={`skeleton-header flex ${
              activeTimeFilter === "monthly"
                ? "flex-row items-center justify-between"
                : "flex-col"
            } gap-1`}
          >
            <div className="skeleton-title bg-accent/20 rounded h-6 w-12"></div>
            {activeTimeFilter === "monthly" && (
              <div className="skeleton-subtitle bg-accent/10 rounded h-4 w-8"></div>
            )}
          </div>
          <div
            className={`skeleton-meals flex ${
              activeTimeFilter === "monthly" ? "flex-row flex-wrap gap-1.5" : "flex-col gap-2"
            }`}
          >
            {activeTimeFilter === "monthly" ? (
              <div className="skeleton-icon w-8 h-8 rounded-full bg-accent/10"></div>
            ) : (
              <div className="skeleton-card bg-primary/20 rounded-lg h-30"></div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export function CalendarTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Your Calendar</h1>;
}

export function CalendarContent() {
  const { user, loading: userLoading } = useUser();
  const [activeTimeFilter, setActiveTimeFilter] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [mealPlanData, setMealPlanData] = useState<MealPlanResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorDate, setCreatorDate] = useState<Date | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Fetch meal plan data
  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user) return;

      setDataLoading(true);
      try {
        // TODO: Get the actual meal plan ID from user preferences or default meal plan
        // For now, we'll handle the case where no plan exists
        const res = await fetch(`${MEAL_PLANS_API_BASE}/default`);

        if (res.ok) {
          const data = await res.json();
          setMealPlanData(data.data);
        }
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchMealPlan();
  }, [user]);

  const isLoading = userLoading || dataLoading;

  const getWeekDays = (baseDate: Date = selectedDate) => {
    const currentDay = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - currentDay);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const getMonthDays = (baseDate: Date = selectedDate) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevDate);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getYearMonths = (baseDate: Date = selectedDate) => {
    const year = baseDate.getFullYear();
    return Array.from({ length: MONTHS_IN_YEAR }, (_, i) => new Date(year, i, 1));
  };

  const getPickerMonthDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, monthIndex, i));
    }

    return days;
  };

  const getMealsForDate = (date: Date): Meal[] => {
    if (!mealPlanData) return [];

    return [];
  };

  const handleMealClick = async (meal: Meal) => {
    try {
      const res = await fetch(`/api/recipes/${meal.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingRecipe(data.data);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  const handleNewMeal = (date?: Date) => {
    setCreatorDate(date || null);
    setCreatorOpen(true);
  };

  const handleRecipeCreated = () => {
    setCreatorOpen(false);
    setCreatorDate(null);
  };

  const handleRecipeDeleted = () => {
    setViewingRecipe(null);
  };

  const getDaysToDisplay = useMemo((): DayMeals[] => {
    let dates: Date[] = [];

    switch (activeTimeFilter) {
      case "weekly":
        dates = getWeekDays();
        break;
      case "monthly":
        dates = getMonthDays();
        break;
      case "yearly":
        dates = getYearMonths();
        break;
    }

    return dates.map((date) => ({
      date,
      meals: getMealsForDate(date),
    }));
  }, [activeTimeFilter, selectedDate, mealPlanData]);

  const pickerDays = useMemo(() => getPickerMonthDays(pickerMonth), [pickerMonth]);
  const weekDaysForDisplay = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const getMealTypeColor = (type: MealType): string => {
    return MEAL_TYPE_COLORS[type] || "bg-gray-500/20 text-gray-600";
  };

  const getMealIcon = (type: MealType): ReactElement => {
    return MEAL_ICONS[type] || <Utensils size={12} className="pointer-events-none" />;
  };

  const getGridCols = () => {
    return activeTimeFilter === "yearly" ? "grid-cols-4" : "grid-cols-7";
  };

  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    if (activeTimeFilter === "monthly") {
      return date.getMonth() === selectedDate.getMonth();
    }
    return true;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (activeTimeFilter === "yearly") {
      setActiveTimeFilter("monthly");
    }
  };

  const navigateMonth = (direction: 1 | -1) => {
    const newMonth = new Date(pickerMonth);
    newMonth.setMonth(pickerMonth.getMonth() + direction);
    setPickerMonth(newMonth);
  };

  const timeFilterButtonClass = (isActive: boolean) =>
    `bg-accent/0 text-accent ring-0 ring-border hover:bg-accent/90 hover:text-primary cursor-pointer transition-all duration-200 rounded-full px-3 py-1 text-xs ${
      isActive ? "bg-accent/20 text-accent ring-2" : ""
    }`;

  return (
    <div className="dashboard-content w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="calendar-actions w-full flex static items-center justify-between h-30 p-3 top-0">
        <div className="calendar-timefilter flex gap-3 items-center justify-center h-full">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveTimeFilter(filter)}
              className={timeFilterButtonClass(activeTimeFilter === filter)}
            >
              {capitalize(filter)}
            </button>
          ))}
        </div>

        <div className="calendar-action-buttons flex gap-3 items-center justify-center h-full">
          {ACTION_BUTTONS.map((action) => (
            <button
              key={action.label}
              onClick={() => action.label === "New" && handleNewMeal()}
              className="bg-accent text-secondary font-semibold ring-0 ring-border hover:bg-accent/60 hover:text-foreground/60 cursor-pointer transition-all duration-200 rounded-xl px-4 py-3 text-xs flex items-center gap-1"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-body flex w-full h-full relative gap-4 p-4">
        <div
          className={`calendar-grid-wrapper flex-1 h-full transition-all duration-500 ease-in-out`}
        >
          <div
            className={`calendar-grid grid ${getGridCols()} max-h-50 h-50 gap-3 w-full transition-all duration-500`}
          >
            {isLoading ? (
              <CalendarSkeleton activeTimeFilter={activeTimeFilter} />
            ) : (
              getDaysToDisplay.map((dayData, index) => (
              <div
                key={index}
                onClick={() => handleDateSelect(dayData.date)}
                className={`calendar-day flex flex-col ${
                  activeTimeFilter === "monthly" ? "gap-2" : "gap-3"
                } bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-all duration-300 cursor-pointer ${
                  activeTimeFilter === "yearly"
                    ? "min-h-50"
                    : activeTimeFilter === "weekly"
                      ? "min-h-max"
                      : ""
                } ${
                  isSelectedDate(dayData.date)
                    ? "ring-2 ring-accent bg-accent/10"
                    : ""
                } ${!isCurrentMonth(dayData.date) ? "opacity-40" : ""}`}
              >
                <div
                  className={`day-header flex ${
                    activeTimeFilter === "monthly"
                      ? "flex-row items-center justify-between"
                      : "flex-col"
                  } gap-1`}
                >
                  {activeTimeFilter === "monthly" ? (
                    <>
                      <span className="pointer-events-none text-xl font-bold text-accent">
                        {dayData.date.getDate()}
                      </span>
                      <span className="pointer-events-none text-[10px] font-semibold text-accent/60">
                        {WEEK_DAYS[dayData.date.getDay()]}
                      </span>
                    </>
                  ) : (
                    <>
                      {activeTimeFilter === "weekly" && (
                        <span className="pointer-events-none text-xs font-semibold text-accent/60">
                          {WEEK_DAYS[dayData.date.getDay()]}
                        </span>
                      )}
                      {activeTimeFilter === "yearly" ? (
                        <span className="pointer-events-none text-lg font-bold text-accent">
                          {MONTH_NAMES[dayData.date.getMonth()]}
                        </span>
                      ) : (
                        <span className="pointer-events-none text-2xl font-bold text-accent">
                          {dayData.date.getDate()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div
                  className={`day-meals flex overflow-hidden min-h-max py-2 ${
                    activeTimeFilter === "monthly"
                      ? "flex-row flex-wrap"
                      : "flex-col"
                  } ${activeTimeFilter === "monthly" ? "gap-0" : "gap-2"}`}
                >
                  {dayData.meals.length > 0 ? (
                    dayData.meals
                      .slice(0, activeTimeFilter === "yearly" ? 1 : 3)
                      .map((meal) =>
                        activeTimeFilter === "monthly" ? (
                          <div
                            key={meal.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMealClick(meal);
                            }}
                            className={`meal-icon-circle w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 -mr-2 cursor-pointer ${getMealTypeColor(
                              meal.type,
                            )}`}
                            title={meal.name}
                          >
                            {getMealIcon(meal.type)}
                          </div>
                        ) : (
                          <button
                            key={meal.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMealClick(meal);
                            }}
                            className="flex flex-col justify-center items-baseline text-left meal-card relative bg-primary/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <div className="meal-image w-full overflow-hidden h-30">
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                style={{
                                  maskImage:
                                    "linear-gradient(to bottom, black 90%, transparent 100%)",
                                  WebkitMaskImage:
                                    "linear-gradient(to bottom, black 90%, transparent 100%)",
                                }}
                              />
                            </div>
                            {activeTimeFilter !== "yearly" && (
                              <div
                                className="meal-info p-2 flex flex-col gap-1 bg-primary/90 absolute bottom-0 w-full max-h-20 overflow-hidden"
                                style={{
                                  maskImage:
                                    "linear-gradient(to top, black 80%, transparent 100%)",
                                  WebkitMaskImage:
                                    "linear-gradient(to top, black 80%, transparent 100%)",
                                }}
                              >
                                <span className="text-xs font-medium text-foreground truncate whitespace-nowrap pointer-events-none">
                                  {meal.name}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-full w-fit ${getMealTypeColor(
                                    meal.type,
                                  )}`}
                                >
                                  {capitalize(meal.type)}
                                </span>
                              </div>
                            )}
                          </button>
                        ),
                      )
                  ) : activeTimeFilter === "monthly" ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewMeal(dayData.date);
                      }}
                      className="empty-day-compact w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed border-accent/20 cursor-pointer hover:border-accent/40 transition-colors duration-200"
                    >
                      <Plus
                        size={14}
                        className="text-accent/30 hover:text-accent/60 transition-colors duration-200"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewMeal(dayData.date);
                      }}
                      className="empty-day flex items-center justify-center border-2 border-dashed border-accent/20 rounded-lg h-30 cursor-pointer hover:border-accent/40 transition-colors duration-200"
                    >
                      <Plus
                        size={activeTimeFilter === "yearly" ? 14 : 18}
                        className="text-accent/30 hover:text-accent/60 transition-colors duration-200"
                      />
                    </div>
                  )}
                  {dayData.meals.length > 3 &&
                    (activeTimeFilter === "monthly" ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/20 text-accent text-[10px] font-bold">
                        +{dayData.meals.length - 3}
                      </div>
                    ) : (
                      <span className="pointer-events-none text-[10px] text-accent/50 font-medium text-center">
                        +
                        {dayData.meals.length -
                          (activeTimeFilter === "yearly" ? 1 : 3)}
                        more
                      </span>
                    ))}
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        <div className="calendar-picker bg-secondary/20 rounded-lg p-4 w-80 flex flex-col gap-4">
          <div className="picker-header flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-accent/20 rounded-lg transition-all duration-200"
            >
              <ChevronLeft size={20} className="text-accent" />
            </button>
            <span className="pointer-events-none text-sm font-bold text-accent">
              {MONTH_NAMES[pickerMonth.getMonth()]} {pickerMonth.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-accent/20 rounded-lg transition-all duration-200"
            >
              <ChevronRight size={20} className="text-accent" />
            </button>
          </div>

          <div className="picker-weekdays grid grid-cols-7 gap-2 text-center">
            {WEEK_DAYS.map((day) => (
              <span
                key={day}
                className="text-[10px] font-semibold text-accent/60"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="picker-days grid grid-cols-7 gap-2">
            {pickerDays.map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`aspect-square rounded-lg text-xs font-medium transition-all duration-200 ${
                  day
                    ? `hover:bg-accent/20 text-foreground ${
                        isSelectedDate(day)
                          ? "bg-accent text-secondary"
                          : "bg-secondary/30"
                      }`
                    : "invisible"
                }`}
              >
                {day?.getDate()}
              </button>
            ))}
          </div>

          <div className="picker-info flex flex-col gap-2 pt-4 border-t-2 border-accent/10">
            <div className="info-row flex items-center justify-between">
              <span className="pointer-events-none text-xs text-accent/60">Selected Date</span>
              <span className="pointer-events-none text-xs font-semibold text-accent">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="info-row flex items-center justify-between">
              <span className="pointer-events-none text-xs text-accent/60">Total Meals</span>
              <span className="pointer-events-none text-xs font-semibold text-accent">
                {getMealsForDate(selectedDate).length}
              </span>
            </div>
          </div>

          <div className="mask-month relative w-full h-20 pointer-events-none self-end overflow-hidden mt-auto flex flex-col">
            <span className="pointer-events-none calendar-selected-month text-4xl font-bold text-accent/20">
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <span className="pointer-events-none calendar-weekrange text-xl font-bold text-accent/25">
              {weekDaysForDisplay[0].getDate()} - {weekDaysForDisplay[6].getDate()}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingRecipe && (
          <RecipeView
            recipe={viewingRecipe}
            isOwner={viewingRecipe.createdBy === user?.id}
            onClose={() => setViewingRecipe(null)}
            onEdit={(recipe) => {
              setEditingRecipe(recipe);
              setViewingRecipe(null);
              setCreatorOpen(true);
            }}
            onDelete={handleRecipeDeleted}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creatorOpen && (
          <RecipeCreator
            initialData={editingRecipe}
            onFinish={handleRecipeCreated}
            onClose={() => {
              setCreatorOpen(false);
              setCreatorDate(null);
              setEditingRecipe(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
