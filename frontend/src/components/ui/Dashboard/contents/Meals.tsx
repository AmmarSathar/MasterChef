import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock4, Flame, MoreHorizontal, Plus } from "lucide-react";

const FALLBACK_IMAGES = {
  beefTacos:
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=300&q=80",
  caesarSalad:
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80",
  carbonara:
    "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?auto=format&fit=crop&w=300&q=80",
  chickenStirFry:
    "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=300&q=80",
  chocolateCookie:
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=300&q=80",
  margherita:
    "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=300&q=80",
};

type MealItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  calories: string;
  image: string;
};

type MealGroup = {
  id: string;
  label: string;
  accentClass: string;
  items: MealItem[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MEALS: MealGroup[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    accentClass: "bg-accent/30 text-accent",
    items: [
      {
        id: "b1",
        title: "Morning Smoothie",
        description: "Berry blend with oats and chia.",
        time: "10 min",
        calories: "240 kcal",
        image: FALLBACK_IMAGES.chocolateCookie,
      },
      {
        id: "b2",
        title: "Avocado Toast",
        description: "Sourdough, feta, lemon zest.",
        time: "12 min",
        calories: "320 kcal",
        image: FALLBACK_IMAGES.margherita,
      },
      {
        id: "b3",
        title: "Greek Yogurt Bowl",
        description: "Granola, honey, fresh berries.",
        time: "8 min",
        calories: "210 kcal",
        image: FALLBACK_IMAGES.caesarSalad,
      },
    ],
  },
  {
    id: "lunch",
    label: "Lunch",
    accentClass: "bg-primary/40 text-primary-foreground",
    items: [
      {
        id: "l1",
        title: "Chicken Stir Fry",
        description: "Ginger garlic glaze, crisp veggies.",
        time: "25 min",
        calories: "540 kcal",
        image: FALLBACK_IMAGES.chickenStirFry,
      },
      {
        id: "l2",
        title: "Caesar Salad",
        description: "Romaine, parmesan, crunchy croutons.",
        time: "15 min",
        calories: "430 kcal",
        image: FALLBACK_IMAGES.caesarSalad,
      },
      {
        id: "l3",
        title: "Beef Tacos",
        description: "Spiced beef, fresh toppings.",
        time: "20 min",
        calories: "610 kcal",
        image: FALLBACK_IMAGES.beefTacos,
      },
    ],
  },
  {
    id: "dinner",
    label: "Dinner",
    accentClass: "bg-secondary/40 text-foreground",
    items: [
      {
        id: "d1",
        title: "Carbonara",
        description: "Creamy pasta with pancetta.",
        time: "30 min",
        calories: "690 kcal",
        image: FALLBACK_IMAGES.carbonara,
      },
      {
        id: "d2",
        title: "Margherita Pizza",
        description: "Tomato, basil, fresh mozzarella.",
        time: "28 min",
        calories: "720 kcal",
        image: FALLBACK_IMAGES.margherita,
      },
    ],
  },
];

function MealCard({
  item,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onSeeRecipe,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: {
  item: MealItem;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onSeeRecipe: (item: MealItem) => void;
  draggable: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 pt-10 shadow-sm transition-all duration-300 hover:shadow-md ${
        isDragging ? "opacity-60 ring-2 ring-accent/40" : ""
      }`}
    >
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
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/60 bg-popover/95 shadow-lg backdrop-blur-sm">
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
              className="w-full px-3 py-2 text-left text-sm text-destructive/80 hover:bg-destructive/10 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div className="absolute -top-6 left-4 h-14 w-14 rounded-full border-4 border-card bg-secondary shadow-md">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1.5 pt-2">
        <h3 className="text-base font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-foreground/60">
        <span className="flex items-center gap-1">
          <Clock4 size={14} />
          {item.time}
        </span>
        <span className="flex items-center gap-1">
          <Flame size={14} />
          {item.calories}
        </span>
      </div>
      <div className="pt-2">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full px-4"
          onClick={() => onSeeRecipe(item)}
        >
          See recipe
        </Button>
      </div>
    </motion.div>
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

export function MealsTitle() {
  return <h1 className="text-xl font-bold text-accent/80">Meals</h1>;
}

export function MealsContent() {
  const [activeDay, setActiveDay] = useState(2);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
    const start = new Date(today);
    start.setDate(today.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<MealItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    groupId: string;
    itemId: string;
    position: "before" | "after";
  } | null>(null);

  const [mealGroups, setMealGroups] = useState<MealGroup[]>(MEALS);
  const [dragging, setDragging] = useState<{ groupId: string; itemId: string } | null>(null);
  const days = useMemo(() => {
    return DAY_LABELS.map((label, index) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + index);
      return {
        id: `day-${index}`,
        label,
        date: d.getDate().toString(),
        dateValue: d,
      };
    });
  }, [weekStart]);

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto pb-4 pr-1">
      <div className="sticky top-0 z-20">
        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <span className="font-semibold">
                Week of {days[0]?.dateValue.toLocaleString("en-US", { month: "short", day: "numeric" })}
              </span>
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
            {days.map((day, index) => {
              const isActive = index === activeDay;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDay(index)}
                  className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "border-accent bg-accent/20 text-accent shadow-sm"
                      : "border-border/50 bg-card text-foreground/70 hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide">
                    {day.label}
                  </span>
                  <span className="text-base">{day.date}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {mealGroups.map((group) => (
          <div
            key={group.id}
            className="grid grid-cols-[70px_1fr] gap-4"
          >
            <div className="flex items-stretch">
              <div
                className={`flex w-full items-center justify-center rounded-2xl ${group.accentClass}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                  {group.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((item) => (
                <MealCard
                  key={item.id}
                  item={item}
                  isMenuOpen={openMenuId === item.id}
                  onToggleMenu={() =>
                    setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                  }
                  onCloseMenu={() => setOpenMenuId(null)}
                  onSeeRecipe={(recipe) => setSelectedRecipe(recipe)}
                  draggable
                  isDragging={dragging?.itemId === item.id}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData(
                      "text/plain",
                      `${group.id}:${item.id}`,
                    );
                    setDragging({ groupId: group.id, itemId: item.id });
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    const rect = e.currentTarget.getBoundingClientRect();
                    const position =
                      e.clientX - rect.left < rect.width / 2 ? "before" : "after";
                    setDragOverTarget({ groupId: group.id, itemId: item.id, position });
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const payload = e.dataTransfer.getData("text/plain");
                    if (!payload) return;
                    const [fromGroupId, fromItemId] = payload.split(":");
                    const toIndex = group.items.findIndex((i) => i.id === item.id);
                    if (!fromGroupId || !fromItemId || toIndex === -1) return;
                    setMealGroups((prev) =>
                      prev.map((g) => {
                        if (fromGroupId === group.id && g.id === group.id) {
                          const fromIndex = g.items.findIndex((i) => i.id === fromItemId);
                          if (fromIndex === -1 || fromIndex === toIndex) return g;
                          const nextItems = [...g.items];
                          const [moved] = nextItems.splice(fromIndex, 1);
                          const hoverPos = dragOverTarget?.position ?? "before";
                          const baseIndex = hoverPos === "after" ? toIndex + 1 : toIndex;
                          const insertAt = fromIndex < baseIndex ? baseIndex - 1 : baseIndex;
                          nextItems.splice(insertAt, 0, moved);
                          return { ...g, items: nextItems };
                        }
                        if (g.id === fromGroupId) {
                          const nextItems = g.items.filter((i) => i.id !== fromItemId);
                          return { ...g, items: nextItems };
                        }
                        if (g.id === group.id) {
                          const sourceGroup = prev.find((grp) => grp.id === fromGroupId);
                          const moved = sourceGroup?.items.find((i) => i.id === fromItemId);
                          if (!moved) return g;
                          const nextItems = [...g.items];
                          const hoverPos = dragOverTarget?.position ?? "before";
                          const insertAt = hoverPos === "after" ? toIndex + 1 : toIndex;
                          nextItems.splice(insertAt, 0, moved);
                          return { ...g, items: nextItems };
                        }
                        return g;
                      }),
                    );
                    setDragging(null);
                    setDragOverTarget(null);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setDragOverTarget(null);
                  }}
                />
              ))}
              <AddMealCard />
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-card bg-secondary shadow-md shrink-0">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedRecipe.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecipe.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock4 size={14} />
                      {selectedRecipe.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={14} />
                      {selectedRecipe.calories}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground"
                onClick={() => setSelectedRecipe(null)}
              >
                <Plus className="rotate-45" size={16} />
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedRecipe(null)}
              >
                Close
              </Button>
              <Button variant="default">View full recipe</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
