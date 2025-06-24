import React from "react";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";
import { Calendar } from "lucide-react";
import { Recording } from "../../store/store";

interface ActivityCalendarProps {
  recordings: Recording[];
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ recordings }) => {
  const today = new Date();
  const thisMonth = subDays(today, 30);

  const daysArray = eachDayOfInterval({
    start: thisMonth,
    end: today,
  });

  const activityData = daysArray.map((day) => {
    const dateString = format(day, "yyyy-MM-dd");
    const count = recordings.filter(
      (r) =>
        typeof r.date === "string" &&
        format(new Date(r.date), "yyyy-MM-dd") === dateString
    ).length;

    return {
      date: dateString,
      count,
    };
  });

  const startDay = (parseISO(activityData[0].date).getDay() + 6) % 7;

  const maxCount = Math.max(...activityData.map((d) => d.count), 4);

  const months = Array.from(new Set(daysArray.map((d) => format(d, "MMM"))));

  const getColorIntensity = (count: number) => {
    if (count === 0) return "bg-gray-100";

    const intensity = Math.min(Math.ceil((count / maxCount) * 4), 4);

    switch (intensity) {
      case 1:
        return "bg-primary/25";
      case 2:
        return "bg-primary/50";
      case 3:
        return "bg-primary/75";
      case 4:
        return "bg-primary";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex gap-3">
        <h3 className="text-lg font-medium mb-6">Activity Calendar</h3>
        <Calendar className="text-violet-500" />
      </div>

      <div className="calendar-heatmap">
        <div className="flex mb-2">
          {months.map((month, i) => (
            <div
              key={month}
              className="flex-1 text-xs text-center text-muted-foreground"
            >
              {month}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Create day labels (Mon, Tue, etc.) */}
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div
              key={day + i}
              className="h-3 text-[10px] flex items-center justify-center text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Fill in empty spaces to align the grid */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-3 w-3"></div>
          ))}

          {/* Activity squares */}
          {activityData.map((day) => (
            <div
              key={day.date}
              tabIndex={0}
              role="button"
              aria-label={`${day.count} recording${
                day.count !== 1 ? "s" : ""
              } on ${day.date}`}
              className={`day h-3 w-3 rounded-sm cursor-pointer transition-all ${getColorIntensity(
                day.count
              )}`}
              title={`${day.date}: ${day.count} recording${
                day.count !== 1 ? "s" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end items-center">
        <div className="text-xs text-muted-foreground mr-2">Less</div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
          <div className="w-3 h-3 rounded-sm bg-primary/25"></div>
          <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
          <div className="w-3 h-3 rounded-sm bg-primary/75"></div>
          <div className="w-3 h-3 rounded-sm bg-primary"></div>
        </div>
        <div className="text-xs text-muted-foreground ml-2">More</div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
