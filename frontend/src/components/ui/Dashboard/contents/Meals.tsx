import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, sync } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import RecipeView from "@components/ui/RecipeView";
import MealPickerPanel from "./MealPickerPanel";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import {
  fetchMealPlanWeek,
  addMealPlanEntry,
  removeMealPlanEntry,
  toMondayIso,
} from "@/lib/api/meal-plan";
import {
  assignCalendarEntry,
  clearCalendarEntry,
  toDateStr,
  type CalendarMealType,
} from "@/lib/api/calendar";

import {
  AlertTriangle,
  BadgeQuestionMark,
  ChevronLeft,
  ChevronRight,
  Clock4,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { type Recipe } from "@masterchef/shared/types";
import {
  type MealEntry,
  type SlotName,
  type DayName,
  type WeekDays,
} from "@/lib/api/meal-plan";
import {
  type MealEntry,
  type SlotName,
  type DayName,
  type WeekDays,
} from "@/lib/api/meal-plan";

const RECIPES_API_BASE = import.meta.env.VITE_BASE_API_URL as string;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SLOT_NAMES: SlotName[] = ["breakfast", "lunch", "dinner"];

const SLOT_LABELS: Record<SlotName, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const SLOT_STYLES: Record<SlotName, string> = {
  breakfast: "bg-accent/30 text-accent",
  lunch: "bg-primary/40 text-primary-foreground",
  dinner: "bg-secondary/40 text-foreground",
};

function buildPositionMap(
  days: WeekDays,
): Record<string, { dayOfWeek: DayName; mealType: SlotName }> {
  const map: Record<string, { dayOfWeek: DayName; mealType: SlotName }> = {};
  for (const [day, slots] of Object.entries(days) as [
    DayName,
    Record<SlotName, MealEntry[]>,
  ][]) {
    for (const [slot, entries] of Object.entries(slots) as [
      SlotName,
      MealEntry[],
    ][]) {
      for (const entry of entries) {
        map[entry.entryId] = { dayOfWeek: day, mealType: slot };
      }
    }
  }
  return map;
}

function findEntryInDays(
  days: WeekDays,
  entryId: string,
): MealEntry | undefined {
  for (const slots of Object.values(days)) {
    for (const entries of Object.values(slots) as MealEntry[][]) {
      const found = entries.find((e) => e.entryId === entryId);
      if (found) return found;
    }
  }
}

function getHashDate(): Date | null {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const raw = params.get("date");
  if (!raw) return null;
  const [y, m, d] = raw.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

function toMonday(date: Date): Date {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function MealCard({
  entry,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onSeeRecipe,
  onRemove,
  isDragging,
  isLoadingRecipe,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  entry: MealEntry;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onSeeRecipe: () => void;
  onRemove: () => void;
  isDragging: boolean;
  isLoadingRecipe: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 pt-10 shadow-sm transition-all duration-300 hover:shadow-md ${
        isDragging ? "opacity-60 ring-2 ring-accent/40" : ""
      }`}
    >
      <AnimatePresence>
        {isLoadingRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm bg-card/50"
          >
            <Spinner variant="infinite" size={28} className="text-accent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
        >
          <MoreHorizontal size={16} />
        </Button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/60 bg-popover/95 shadow-lg backdrop-blur-sm z-10">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-foreground/80 hover:bg-secondary/50 transition-colors"
            >
              Add to shopping list
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-foreground/80 hover:bg-secondary/50 transition-colors"
            >
              Mark as cooked
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-foreground/80 hover:bg-secondary/50 transition-colors"
            >
              Replace meal
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="w-full px-3 py-2 text-left text-sm text-destructive/80 hover:bg-destructive/10 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="absolute -top-6 left-4 h-14 w-14 rounded-full border-4 border-card bg-secondary shadow-md overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/60">
            <BadgeQuestionMark size={28} className="text-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 pt-2">
        <h3 className="text-base font-semibold text-foreground">
          {entry.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {entry.description}
        </p>
      </div>

      {entry.cookingTime > 0 && (
        <div className="flex items-center gap-1 text-xs text-foreground/60">
          <Clock4 size={14} />
          {entry.cookingTime} min
        </div>
      )}

      <div className="pt-2">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full px-4"
          onClick={onSeeRecipe}
        >
          See recipe
        </Button>
      </div>
    </div>
  );
}

function AddMealCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-card/40 text-foreground/60 transition-all duration-300 hover:border-accent/60 hover:text-foreground"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
        <Plus size={20} />
      </div>
      <span className="text-sm font-semibold">Add item</span>
    </button>
  );
}

function MealCardSkeleton() {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 pt-10 shadow-sm min-h-48">
      <div className="absolute -top-6 left-4 h-14 w-14 rounded-full border-4 border-card bg-muted animate-pulse" />
      <div className="flex flex-col gap-2 pt-2">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-3 w-16 rounded bg-muted animate-pulse" />
      <div className="h-8 w-24 rounded-full bg-muted animate-pulse mt-auto" />
    </div>
  );
}

function MealsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {SLOT_NAMES.map((slot) => (
        <div key={slot} className="grid grid-cols-[70px_1fr] gap-4">
          <div className="flex items-stretch">
            <div
              className={`flex w-full items-center justify-center rounded-2xl ${SLOT_STYLES[slot]}`}
            >
              <span className="text-xs font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                {SLOT_LABELS[slot]}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-6">
            <MealCardSkeleton />
            <MealCardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MealsTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Meals</h1>;
}

function MealsRecipeViewer({
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

export function MealsContent() {
  const [activeDay, setActiveDay] = useState<number>(() => {
    const date = getHashDate() ?? new Date();
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  });

  const [weekStart, setWeekStart] = useState<Date>(() =>
    toMonday(getHashDate() ?? new Date()),
  );

  const [days, setDays] = useState<WeekDays | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncWarn, setSyncWarn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);
  const [viewedRecipe, setViewedRecipe] = useState<Recipe | null>(null);
  const [pickerTarget, setPickerTarget] = useState<{
    slot: SlotName;
    dayName: DayName;
  } | null>(null);
  const [dragging, setDragging] = useState<{
    slotName: SlotName;
    entryId: string;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    slotName: SlotName;
    entryId: string;
    position: "before" | "after";
  } | null>(null);

  const daysRef = useRef<WeekDays | null>(null);
  const weekStartRef = useRef<Date>(weekStart);
  const mealPlanIdRef = useRef<string | null>(null);
  const originalDaysRef = useRef<WeekDays | null>(null);
  const isDirtyRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let syncToastWarn: string | undefined;

  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  useEffect(() => {
    weekStartRef.current = weekStart;
  }, [weekStart]);

  const weekDates = useMemo(
    () =>
      DAY_LABELS.map((label, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return { label, dateNum: d.getDate().toString(), dateValue: d };
      }),
    [weekStart],
  );

  const activeDayMeals = useMemo(
    () => days?.[DAY_NAMES[activeDay]] ?? null,
    [days, activeDay],
  );

  const existingRecipeIds = useMemo(() => {
    if (!days || !pickerTarget) return new Set<string>();
    const daySlots = days[pickerTarget.dayName] ?? {};
    const ids: string[] = [];
    for (const slot of SLOT_NAMES) {
      for (const entry of daySlots[slot] ?? []) {
        ids.push(entry.recipeId);
      }
    }
    return new Set(ids);
  }, [days, pickerTarget]);

  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    isDirtyRef.current = false;
    setDays(null);
    setLoading(true);

    fetchMealPlanWeek(toMondayIso(weekStart))
      .then((data) => {
        setDays(data.days);
        mealPlanIdRef.current = data.id;
        originalDaysRef.current = data.days;
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(
    () => () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    },
    [],
  );

  const syncPendingChanges = async () => {
    if (
      !isDirtyRef.current ||
      !daysRef.current ||
      !originalDaysRef.current ||
      !mealPlanIdRef.current
    )
      return;

    isDirtyRef.current = false;
    setSyncing(true);
    
    toast.dismiss(syncToastWarn as string);
    syncToastWarn = toast.loading("Saving changes...", {
      position: "bottom-right",
    });


    window.addEventListener("beforeunload", (e) => {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    });

    const mealPlanId = mealPlanIdRef.current;

    try {
      const orig = buildPositionMap(originalDaysRef.current);
      const curr = buildPositionMap(daysRef.current);

      const renames = new Map<string, string>();

      for (const [entryId, currPos] of Object.entries(curr)) {
        const origPos = orig[entryId];
        if (!origPos) continue; // added via picker, already persisted
        if (
          origPos.dayOfWeek === currPos.dayOfWeek &&
          origPos.mealType === currPos.mealType
        )
          continue;

        const entry = findEntryInDays(daysRef.current!, entryId);
        if (!entry) continue;

        await removeMealPlanEntry(entryId);
        const { entryId: newEntryId } = await addMealPlanEntry(mealPlanId, {
          dayOfWeek: currPos.dayOfWeek,
          mealType: currPos.mealType,
          recipeId: entry.recipeId,
          notes: entry.notes || undefined,
        });
        renames.set(entryId, newEntryId);

        const d = new Date(weekStartRef.current);
        d.setDate(d.getDate() + DAY_NAMES.indexOf(currPos.dayOfWeek));
        const dateStr = toDateStr(d);
        try {
          await clearCalendarEntry(
            dateStr,
            origPos.mealType as CalendarMealType,
          );
        } catch (err) {
          console.error("Failed to clear calendar entry:", err);
        }

        await assignCalendarEntry(
          dateStr,
          currPos.mealType as CalendarMealType,
          entry.recipeId,
        );
      }

      for (const entryId of Object.keys(orig)) {
        if (!curr[entryId]) {
          await removeMealPlanEntry(entryId);
        }
      }

      if (renames.size > 0) {
        const applyRenames = (data: WeekDays): WeekDays => {
          const result = { ...data } as WeekDays;
          for (const dayName of Object.keys(result) as DayName[]) {
            result[dayName] = { ...result[dayName] };
            for (const slot of SLOT_NAMES) {
              result[dayName][slot] = result[dayName][slot].map((e) => {
                const newId = renames.get(e.entryId);
                return newId ? { ...e, entryId: newId } : e;
              });
            }
          }
          return result;
        };
        setDays((prev) => (prev ? applyRenames(prev) : prev));
        if (originalDaysRef.current) {
          originalDaysRef.current = applyRenames(originalDaysRef.current);
        }
      }

      const fresh = await fetchMealPlanWeek(toMondayIso(weekStartRef.current));
      mealPlanIdRef.current = fresh.id;
      originalDaysRef.current = fresh.days;
      if (!isDirtyRef.current) {
        setDays(fresh.days);
      }
    } catch (err) {
      console.error("[MealPlan] Sync failed:", err);
      toast.error("Couldn't save changes. Refreshing…");
      try {
        const fresh = await fetchMealPlanWeek(
          toMondayIso(weekStartRef.current),
        );
        const fresh = await fetchMealPlanWeek(
          toMondayIso(weekStartRef.current),
        );
        setDays(fresh.days);
        mealPlanIdRef.current = fresh.id;
        originalDaysRef.current = fresh.days;
        isDirtyRef.current = false;
      } catch {
        isDirtyRef.current = true;
      }
    } finally {
      setSyncing(false);
      toast.dismiss(syncToastWarn as string);

      toast.success("Changes saved!", {
        position: "bottom-right",
      });
    }
  };

  const scheduleSyncTimer = () => {
    syncToastWarn = toast.error(
      "Please wait, the selection has unsaved changes...",
      {
        position: "bottom-right",
        duration: Infinity,
      },
    );

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(syncPendingChanges, 1500);
  };

  const handleDrop = (
    e: React.DragEvent,
    toSlot: SlotName,
    toEntryId: string | null,
  ) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;

    const sep = payload.indexOf(":");
    const fromSlot = payload.slice(0, sep) as SlotName;
    const fromEntryId = payload.slice(sep + 1);
    const hoverPos = dragOverTarget?.position ?? "after";

    setDays((prev) => {
      if (!prev) return prev;
      const dayName = DAY_NAMES[activeDay];
      const daySlots = prev[dayName];

      const newFromItems = [...daySlots[fromSlot]];
      const newToItems =
        fromSlot === toSlot ? newFromItems : [...daySlots[toSlot]];

      const fromIndex = newFromItems.findIndex(
        (e) => e.entryId === fromEntryId,
      );
      if (fromIndex === -1) return prev;
      const [movedEntry] = newFromItems.splice(fromIndex, 1);

      if (toEntryId === null) {
        newToItems.push(movedEntry);
      } else {
        const toIndex = newToItems.findIndex((e) => e.entryId === toEntryId);
        const base = hoverPos === "after" ? toIndex + 1 : toIndex;
        const insertAt =
          fromSlot === toSlot && fromIndex < base ? base - 1 : base;
        newToItems.splice(Math.max(0, insertAt), 0, movedEntry);
      }

      const updatedDay: Record<SlotName, MealEntry[]> = {
        ...daySlots,
        [fromSlot]: newFromItems,
        [toSlot]: newToItems,
      };
      return { ...prev, [dayName]: updatedDay };
    });

    isDirtyRef.current = true;
    scheduleSyncTimer();
    setDragging(null);
    setDragOverTarget(null);
  };

  const handleRemove = (slotName: SlotName, entryId: string) => {
    setDays((prev) => {
      if (!prev) return prev;
      const dayName = DAY_NAMES[activeDay];
      const daySlots = prev[dayName];
      return {
        ...prev,
        [dayName]: {
          ...daySlots,
          [slotName]: daySlots[slotName].filter((e) => e.entryId !== entryId),
        },
      };
    });
    isDirtyRef.current = true;
    scheduleSyncTimer();
    setOpenMenuId(null);
  };

  const handleSeeRecipe = async (entry: MealEntry) => {
    setLoadingRecipeId(entry.entryId);
    try {
      const res = await fetch(
        `${RECIPES_API_BASE}/recipes/${encodeURIComponent(entry.recipeId)}`,
        { credentials: "include" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Failed to load recipe");
      setViewedRecipe(json.data as Recipe);
    } catch (err) {
      console.error("[Meals] Failed to fetch recipe:", err);
    } finally {
      setLoadingRecipeId(null);
    }
  };

  const handlePickerSelect = (entry: MealEntry) => {
    if (!pickerTarget) return;
    const { slot, dayName } = pickerTarget;

    const updater = (prev: WeekDays): WeekDays => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [slot]: [...prev[dayName][slot], entry],
      },
    });

    setDays((prev) => (prev ? updater(prev) : prev));
    if (originalDaysRef.current) {
      originalDaysRef.current = updater(originalDaysRef.current);
    }

    setPickerTarget(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto pb-4 pr-1">
      <div className="sticky top-0 z-20">
        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <span className="font-semibold pointer-events-none">
                Week of{" "}
                {weekDates[0]?.dateValue.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {syncing && (
                <span className="text-xs text-muted-foreground italic">
                  Saving…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground"
                onClick={() => {
                  const prev = new Date(weekStart);
                  prev.setDate(weekStart.getDate() - 7);
                  setWeekStart(prev);
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
                  next.setDate(weekStart.getDate() + 7);
                  setWeekStart(next);
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 noScrollbar">
            {weekDates.map(({ label, dateNum }, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveDay(i)}
                className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 hover:animate-pulse ${
                  i === activeDay
                    ? "border-accent bg-accent/20 text-accent shadow-sm"
                    : "border-border/50 bg-card text-foreground/70 hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wide pointer-events-none">
                  {label}
                </span>
                <span className="text-base pointer-events-none">{dateNum}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {loading || !activeDayMeals ? (
            <motion.div
              key="meals-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MealsLoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="meals-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {SLOT_NAMES.map((slot) => (
                <div key={slot} className="grid grid-cols-[70px_1fr] gap-4">
                  <div className="flex items-stretch">
                    <div
                      className={`flex w-full items-center justify-center rounded-2xl ${SLOT_STYLES[slot]}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                        {SLOT_LABELS[slot]}
                      </span>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, slot, null)}
                  >
                    {activeDayMeals[slot].map((entry) => (
                      <MealCard
                        key={entry.entryId}
                        entry={entry}
                        isDragging={dragging?.entryId === entry.entryId}
                        isMenuOpen={openMenuId === entry.entryId}
                        isLoadingRecipe={loadingRecipeId === entry.entryId}
                        onToggleMenu={() =>
                          setOpenMenuId((prev) =>
                            prev === entry.entryId ? null : entry.entryId,
                          )
                        }
                        onCloseMenu={() => setOpenMenuId(null)}
                        onSeeRecipe={() => handleSeeRecipe(entry)}
                        onRemove={() => handleRemove(slot, entry.entryId)}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData(
                            "text/plain",
                            `${slot}:${entry.entryId}`,
                          );
                          setDragging({
                            slotName: slot,
                            entryId: entry.entryId,
                          });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.dataTransfer.dropEffect = "move";
                          const rect = e.currentTarget.getBoundingClientRect();
                          const position =
                            e.clientX - rect.left < rect.width / 2
                              ? "before"
                              : "after";
                          setDragOverTarget({
                            slotName: slot,
                            entryId: entry.entryId,
                            position,
                          });
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDrop(e, slot, entry.entryId);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setDragOverTarget(null);
                        }}
                      />
                    ))}
                    <AddMealCard
                      onClick={() =>
                        setPickerTarget({ slot, dayName: DAY_NAMES[activeDay] })
                      }
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pickerTarget && mealPlanIdRef.current && (
          <MealPickerPanel
            key="meal-picker"
            slot={pickerTarget.slot}
            dayName={pickerTarget.dayName}
            mealPlanId={mealPlanIdRef.current}
            existingRecipeIds={existingRecipeIds}
            onSelect={handlePickerSelect}
            onClose={() => setPickerTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewedRecipe && (
          <MealsRecipeViewer
          <MealsRecipeViewer
            key={viewedRecipe.id}
            recipe={viewedRecipe}
            onClose={() => setViewedRecipe(null)}
          />
        )}
      </AnimatePresence>

      {/* <AnimatePresence>
        {syncWarn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`${isSyncing ? "h-15 w-60" : "h-15 w-105"} transition-all duration-500 ease-out-cubic bg-linear-to-br from-accent/20 to-transparent backdrop-opacity-10 flex p-3 rounded-xl ring-2 ring-border/30 shadow-lg shadow-accent/10 flex-col items-center justify-center gap-2 fixed bottom-4 right-4 z-50`}
          >
            <div
              className="backdrop-ping animate-ping h-full w-full rounded-xl absolute top-0 left-1/2 -translate-x-1/2 bg-border/30 z-[-1]"
              style={{ maxWidth: "60%", maxHeight: "200px" }}
            />
            <AnimatePresence>
              <motion.span
                key="syncing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-sm font-bold text-foreground/80 flex items-center pl-6 whitespace-nowrap"
              >
                {isSyncing ? (
                  <>
                    <Spinner
                      size={26}
                      className="text-accent brightness-125 animate-spin absolute top-4 left-4"
                    />
                    Syncing changes...
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      size={26}
                      className="text-destructive brightness-200 animate-pulse absolute top-4 left-4"
                    ></AlertTriangle>
                    Please wait, the selection has unsaved changes...
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}
