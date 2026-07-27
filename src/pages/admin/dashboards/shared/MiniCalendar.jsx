import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MiniCalendar({ markedDates = [] }) {
  const [cursor, setCursor] = useState(new Date());
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#735366]">
          {format(cursor, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor((d) => subMonths(d, 1))}
            className="h-7 w-7 rounded-lg hover:bg-[#FAEEE9] text-[#A77A95] flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="h-7 w-7 rounded-lg hover:bg-[#FAEEE9] text-[#A77A95] flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          const marked = markedDates.some((m) => isSameDay(m, day));

          return (
            <div
              key={day.toISOString()}
              className={`relative h-8 flex items-center justify-center rounded-lg text-xs ${
                isToday
                  ? "bg-[#A77A95] text-white font-bold shadow-sm"
                  : inMonth
                    ? "text-[#735366] hover:bg-[#FAEEE9]"
                    : "text-slate-300"
              }`}
            >
              {format(day, "d")}
              {marked && !isToday ? (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#D4B87A]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
