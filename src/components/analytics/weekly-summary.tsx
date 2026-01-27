"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange } from "lucide-react";
import type { WeeklySummary } from "@/lib/stats";

interface WeeklySummaryViewProps {
  summaries: WeeklySummary[];
}

export function WeeklySummaryView({ summaries }: WeeklySummaryViewProps) {
  if (summaries.length === 0) {
    return null;
  }

  // Most recent week first
  const sorted = [...summaries];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="size-5" />
          Weekly Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completion rates for the last {sorted.length} weeks
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((week, idx) => (
            <div
              key={week.weekStart}
              className="flex items-center gap-3"
            >
              {/* Week label */}
              <div className="w-24 sm:w-36 shrink-0">
                <p className="text-sm font-medium">
                  {idx === 0 ? "This week" : week.weekLabel}
                </p>
                {idx !== 0 && (
                  <p className="text-xs text-muted-foreground">
                    {week.totalCompleted}/{week.totalExpected} done
                  </p>
                )}
                {idx === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {week.totalCompleted}/{week.totalExpected} done
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="flex-1 min-w-0">
                <div className="h-6 w-full overflow-hidden rounded-md bg-muted relative">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${
                      week.percentage >= 80
                        ? "bg-green-500"
                        : week.percentage >= 50
                          ? "bg-yellow-500"
                          : week.percentage > 0
                            ? "bg-red-400"
                            : "bg-muted"
                    }`}
                    style={{ width: `${Math.max(week.percentage, 0)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {week.percentage}%
                  </span>
                </div>
              </div>

              {/* Per-habit dots (hidden on mobile to save space) */}
              <div className="hidden sm:flex gap-1 shrink-0">
                {week.perHabit.slice(0, 6).map((h) => (
                  <div
                    key={h.habitId}
                    className="size-4 rounded-full border"
                    style={{
                      backgroundColor:
                        h.rate >= 0.8
                          ? h.habitColor
                          : h.rate > 0
                            ? h.habitColor + "60"
                            : "transparent",
                      borderColor: h.habitColor,
                    }}
                    title={`${h.habitName}: ${h.completed}/${h.expected}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
