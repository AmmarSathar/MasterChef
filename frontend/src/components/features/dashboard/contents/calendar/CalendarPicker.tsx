import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DAYS_OF_WEEK, MONTH_NAMES } from "@masterchef/shared/constants";

const _dayLabels = DAYS_OF_WEEK.map((d) => d.label.slice(0, 3));
const WEEKDAY_SHORT = [_dayLabels[6], ..._dayLabels.slice(0, 6)];

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

interface CalendarPickerProps {
  onDaySelect: (date: Date) => void;
}

export function CalendarPicker({ onDaySelect }: CalendarPickerProps) {
  const [month, setMonth] = useState(new Date());
  const days = useMemo(() => getMonthGridDates(month), [month]);

  const prev = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const next = () =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="picker-root bg-card border border-border rounded-2xl p-4">
      <div className="picker-header flex items-center justify-between mb-2">
        <h3 className="text-sm uppercase tracking-[0.2em] text-accent">
          Timeline
        </h3>
        <CalendarDays size={16} className="text-accent" />
      </div>
      <div className="month-nav flex items-center justify-between mb-3">
        <button
          onClick={prev}
          className="p-1 rounded hover:bg-secondary transition text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} />
        </button>
        <span className="text-xs text-muted-foreground">
          {MONTH_NAMES[month.getMonth()].slice(0, 3)} {month.getFullYear()}
        </span>
        <button
          onClick={next}
          className="p-1 rounded hover:bg-secondary transition text-muted-foreground hover:text-foreground"
        >
          <ChevronRight size={12} />
        </button>
      </div>
      <div className="day-grid grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_SHORT.map((d) => (
          <span key={d} className="text-[10px] text-muted-foreground pb-1">
            {d[0]}
          </span>
        ))}
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => onDaySelect(day)}
            className={`text-xs rounded py-1 transition hover:bg-secondary ${
              day.getMonth() === month.getMonth()
                ? "text-foreground"
                : "text-muted-foreground/40"
            }`}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
