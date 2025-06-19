import React from "react";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";
import { useStore } from "../../store/store";

const ActivityCalendar: React.FC = () => {
  const { recordings } = useStore();

  // Generate activity data for the last 60 days
  const today = new Date();
  const sixtyDaysAgo = subDays(today, 59);

  const daysArray = eachDayOfInterval({
    start: sixtyDaysAgo,
    end: today,
  });

  // Count recordings per day
  const activityData = daysArray.map((day) => {
    const dateString = format(day, "yyyy-MM-dd");
    const count = recordings.filter(
      (r) => typeof r.date === "string" && r.date.startsWith(dateString)
    ).length;

    return {
      date: dateString,
      count,
    };
  });

  // Calculate the highest count for scaling
  const maxCount = Math.max(...activityData.map((d) => d.count), 1);

  // Generate month labels
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
      <h3 className="text-lg font-medium mb-6">Activity Calendar</h3>

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
          {Array.from({ length: parseISO(activityData[0].date).getDay() }).map(
            (_, i) => (
              <div key={`empty-${i}`} className="h-3"></div>
            )
          )}

          {/* Activity squares */}
          {activityData.map((day) => (
            <div
              key={day.date}
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
