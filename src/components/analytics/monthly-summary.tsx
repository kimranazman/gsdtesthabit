"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { MonthlySummary } from "@/lib/stats";

interface MonthlySummaryViewProps {
  summaries: MonthlySummary[];
}

export function MonthlySummaryView({ summaries }: MonthlySummaryViewProps) {
  if (summaries.length === 0) {
    return null;
  }

  const sorted = [...summaries];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Monthly Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completion rates for the last {sorted.length} months
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((month, idx) => (
            <MonthCard key={month.monthStart} month={month} isCurrent={idx === 0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthCard({
  month,
  isCurrent,
}: {
  month: MonthlySummary;
  isCurrent: boolean;
}) {
  const rateColor =
    month.percentage >= 80
      ? "text-green-600 dark:text-green-400"
      : month.percentage >= 50
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-500 dark:text-red-400";

  const barColor =
    month.percentage >= 80
      ? "bg-green-500"
      : month.percentage >= 50
        ? "bg-yellow-500"
        : month.percentage > 0
          ? "bg-red-400"
          : "bg-muted";

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm">
            {isCurrent ? "This month" : month.monthLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {month.totalCompleted}/{month.totalExpected} completed
          </p>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${rateColor}`}>
          {month.percentage}%
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(month.percentage, 0)}%` }}
        />
      </div>

      {/* Per-habit breakdown */}
      <div className="space-y-1.5">
        {month.perHabit.slice(0, 5).map((h) => {
          const pct = Math.round(h.rate * 100);
          return (
            <div key={h.habitId} className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: h.habitColor }}
              />
              <span className="text-xs truncate flex-1">{h.habitName}</span>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
        {month.perHabit.length > 5 && (
          <p className="text-xs text-muted-foreground">
            +{month.perHabit.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
}
