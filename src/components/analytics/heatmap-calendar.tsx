"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import {
  generateHeatmapData,
  getHeatmapMaxCount,
  getHeatmapLevel,
  type HeatmapDay,
} from "@/lib/stats";
import { format } from "date-fns";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const LEVEL_COLORS = [
  "bg-muted",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-300",
];

interface HeatmapCalendarProps {
  completionDates: string[];
}

export function HeatmapCalendar({ completionDates }: HeatmapCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const heatmapData = useMemo(
    () => generateHeatmapData(completionDates, today),
    [completionDates, today]
  );
  const maxCount = useMemo(
    () => getHeatmapMaxCount(heatmapData),
    [heatmapData]
  );

  // Group days into columns (weeks). Each column has 7 rows (Sun=0 to Sat=6).
  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    // Pad the first week with empty slots
    const firstDay = heatmapData[0];
    if (firstDay) {
      for (let i = 0; i < firstDay.dayOfWeek; i++) {
        currentWeek.push({
          date: "",
          count: -1, // sentinel for empty
          dayOfWeek: i,
          month: firstDay.month,
          isToday: false,
        });
      }
    }

    for (const day of heatmapData) {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    return result;
  }, [heatmapData]);

  // Determine month labels and positions
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      // Find the first real day in this week
      const realDay = week.find((d) => d.count >= 0);
      if (realDay && realDay.month !== lastMonth) {
        positions.push({ label: MONTH_LABELS[realDay.month], col: colIdx });
        lastMonth = realDay.month;
      }
    });
    return positions;
  }, [weeks]);

  const totalCompletions = completionDates.length;
  const activeDays = heatmapData.filter((d) => d.count > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          Contribution Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalCompletions} completions across {activeDays} active days in the
          past year
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Month labels */}
            <div className="flex mb-1 ml-8">
              {monthPositions.map(({ label, col }, idx) => (
                <div
                  key={`${label}-${col}-${idx}`}
                  className="text-xs text-muted-foreground"
                  style={{
                    position: "relative",
                    left: `${col * 14}px`,
                    marginRight:
                      idx < monthPositions.length - 1
                        ? `${
                            (monthPositions[idx + 1].col -
                              col) *
                              14 -
                            28
                          }px`
                        : undefined,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1 shrink-0">
                {DAY_LABELS.map((label, idx) => (
                  <div
                    key={idx}
                    className="h-[12px] text-[10px] leading-[12px] text-muted-foreground text-right pr-1 w-6"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day, dayIdx) => {
                    if (day.count < 0) {
                      // Empty padding cell
                      return (
                        <div
                          key={dayIdx}
                          className="h-[12px] w-[12px] rounded-[2px]"
                        />
                      );
                    }

                    const level = getHeatmapLevel(day.count, maxCount);
                    const dateLabel = day.date
                      ? format(new Date(day.date + "T12:00:00"), "MMM d, yyyy")
                      : "";

                    return (
                      <Tooltip key={dayIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-[12px] w-[12px] rounded-[2px] ${
                              LEVEL_COLORS[level]
                            } ${
                              day.isToday
                                ? "ring-1 ring-foreground/40"
                                : ""
                            } transition-colors`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <span className="font-medium">
                            {day.count} completion{day.count !== 1 ? "s" : ""}
                          </span>{" "}
                          on {dateLabel}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-xs text-muted-foreground mr-1">Less</span>
              {LEVEL_COLORS.map((color, idx) => (
                <div
                  key={idx}
                  className={`h-[12px] w-[12px] rounded-[2px] ${color}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
