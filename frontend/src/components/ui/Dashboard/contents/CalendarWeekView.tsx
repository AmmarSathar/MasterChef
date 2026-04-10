import { Plus } from "lucide-react";
import { DAYS_OF_WEEK } from "@masterchef/shared/constants";
import { MEAL_SLOTS } from "./CalendarDayView";
import {
  emptyCalendarDay,
  type CalendarDayData,
  type CalendarMealType,
} from "@/lib/api/calendar";

const _dayLabels = DAYS_OF_WEEK.map((d) => d.label.slice(0, 3));
const WEEKDAY_SHORT = [_dayLabels[6], ..._dayLabels.slice(0, 6)];

const toDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function CalendarWeekViewSkeleton() {
  return (
    <div className="week-grid grid grid-cols-7 gap-3">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="day-col flex flex-col">
          <div className="day-label mb-2 text-center">
            <div className="h-2.5 w-5 mx-auto rounded bg-muted animate-pulse mb-1.5" />
            <div className="h-8 w-8 mx-auto rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="meal-slots space-y-2">
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CalendarWeekViewProps {
  dates: Date[];
  selectionsByDay: Record<string, CalendarDayData>;
  onDayClick: (date: Date) => void;
}

export default function CalendarWeekView({
  dates,
  selectionsByDay,
  onDayClick,
}: CalendarWeekViewProps) {
  return (
    <div className="week-grid grid grid-cols-7 gap-3">
      {dates.map((date) => {
        const key = toDateKey(date);
        const dayMeals = selectionsByDay[key] ?? emptyCalendarDay();
        return (
          <div
            key={key}
            onClick={() => onDayClick(date)}
            className="day-col cursor-pointer hover:bg-secondary/30 transition duration-300 rounded-2xl flex flex-col"
          >
            <div className="day-label mb-2 text-center pointer-events-none">
              <p className="text-xs scale-95 -ml-1 uppercase tracking-[0.22em] text-muted-foreground">
                {WEEKDAY_SHORT[date.getDay()]}
              </p>
              <p className="text-2xl font-semibold">{date.getDate()}</p>
            </div>
            <div className="meal-slots space-y-2 pointer-events-auto">
              {MEAL_SLOTS.map((slot) => {
                const meal = dayMeals[slot as CalendarMealType];
                return meal ? (
                  <div
                    key={slot}
                    className="meal-card h-28 rounded-xl overflow-hidden relative p-0"
                  >
                    <img
                      src={meal.imageUrl}
                      className="w-full h-full object-cover m-0 pointer-events-auto cursor-pointer"
                    />
                    <div className="meal-overlay absolute inset-0 bg-linear-to-t from-black/85 to-transparent p-2 flex flex-col justify-end pointer-events-none">
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
                    className="meal-slot-empty h-28 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/70 transition duration-300"
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
  );
}
