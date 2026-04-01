import { ArrowLeft } from "lucide-react";
import {
  DAYS_OF_WEEK,
  MEAL_TYPES,
  MONTH_NAMES,
  type MealType,
} from "@masterchef/shared/constants";
import type { Recipe } from "@masterchef/shared/types";

import { motion } from "framer-motion";

export type MealSlot = Exclude<MealType, "snack">;

export type MealPrepOption = Pick<Recipe, "id" | "title"> & {
  imageUrl: string;
  duration: string;
  kcal: number;
};

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

export const EXAMPLE_MEALPLAN: Record<MealSlot, MealPrepOption[]> = {
  breakfast: [
    {
      id: "b1",
      title: "Artisan Avocado and Poached Egg",
      imageUrl:
        "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=1200",
      duration: "15 mins",
      kcal: 380,
    },
    {
      id: "b2",
      title: "Honey and Blueberry Granola Bowl",
      imageUrl:
        "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=1200",
      duration: "5 mins",
      kcal: 320,
    },
    {
      id: "b3",
      title: "Power Smoothie",
      imageUrl:
        "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=1200",
      duration: "10 mins",
      kcal: 290,
    },
  ],
  lunch: [
    {
      id: "l1",
      title: "Grilled Chicken Greek Salad",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
      duration: "20 mins",
      kcal: 520,
    },
    {
      id: "l2",
      title: "Roasted Veggie Harvest Bowl",
      imageUrl:
        "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200",
      duration: "25 mins",
      kcal: 480,
    },
    {
      id: "l3",
      title: "Tomato Basil and Sourdough Toast",
      imageUrl:
        "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=1200",
      duration: "15 mins",
      kcal: 460,
    },
  ],
  dinner: [
    {
      id: "d1",
      title: "Pan-Seared Salmon and Greens",
      imageUrl:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
      duration: "30 mins",
      kcal: 610,
    },
    {
      id: "d2",
      title: "Slow-Braised Short Ribs",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200",
      duration: "120 mins",
      kcal: 750,
    },
    {
      id: "d3",
      title: "Wild Mushroom Risotto",
      imageUrl:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200",
      duration: "45 mins",
      kcal: 580,
    },
  ],
};

interface Props {
  date: Date;
  meals: Partial<Record<MealSlot, MealPrepOption>>;
  onBack: () => void;
  onNewRecipe: () => void;
  onChooseMeal: (slot: MealSlot, option: MealPrepOption) => void;
}

export function CalendarDayView({
  date,
  meals,
  onBack,
  onNewRecipe,
  onChooseMeal,
}: Props) {
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
          {MEAL_SLOTS.map((slot) => (
            <div className="meal-section" key={slot}>
              <h3 className="meal-plan-label text-2xl italic mb-3 text-foreground/90">
                {SLOT_LABELS[slot]}
              </h3>
              <div className="meal-options grid grid-cols-3 gap-3">
                {EXAMPLE_MEALPLAN[slot].map((option) => {
                  const active = meals[slot]?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => onChooseMeal(slot, option)}
                      className={`rounded-xl overflow-hidden text-left border transition cursor-pointer ${
                        active
                          ? "border-accent ring-2 ring-accent/50"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="option-card h-44 relative pointer-events-none">
                        <img
                          src={option.imageUrl}
                          alt={option.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="option-overlay absolute inset-0 bg-linear-to-t from-black/85 to-transparent p-3 flex flex-col justify-end">
                          <p className="text-xs scale-95 -ml-1 uppercase tracking-[0.2em] text-accent">
                            {option.duration}
                          </p>
                          <p className="font-semibold leading-tight">
                            {option.title}
                          </p>
                          <span className="mt-2 text-xs scale-95 -ml-1 uppercase tracking-[0.2em] bg-accent text-accent-foreground rounded px-2 py-1 w-fit">
                            {!active ? "Select Choice" : "Selected"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
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
    </motion.div>
  );
}
