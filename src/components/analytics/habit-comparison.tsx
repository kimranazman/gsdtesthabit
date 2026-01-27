"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitIcon } from "@/components/habits/habit-icon";
import type { HabitComparisonItem } from "@/lib/stats";

interface HabitComparisonProps {
  best: HabitComparisonItem[];
  struggling: HabitComparisonItem[];
}

function ComparisonRow({ item }: { item: HabitComparisonItem }) {
  const rateColor =
    item.rate >= 80
      ? "bg-green-500"
      : item.rate >= 50
        ? "bg-yellow-500"
        : "bg-red-500";

  const textColor =
    item.rate >= 80
      ? "text-green-600 dark:text-green-400"
      : item.rate >= 50
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-500 dark:text-red-400";

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: item.habitColor + "20", color: item.habitColor }}
      >
        <HabitIcon name={item.habitIcon} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">{item.habitName}</p>
          <span className={`text-sm font-bold tabular-nums ml-2 ${textColor}`}>
            {item.rate}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${rateColor}`}
            style={{ width: `${Math.min(item.rate, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.completed}/{item.expected} completed (30 days)
        </p>
      </div>
    </div>
  );
}

export function HabitComparison({ best, struggling }: HabitComparisonProps) {
  if (best.length === 0 && struggling.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habit Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Not enough data to compare habits yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Best performing */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-green-500" />
            <CardTitle className="text-base">Best Performing</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Top habits by 30-day completion rate
          </p>
        </CardHeader>
        <CardContent>
          {best.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No data yet</p>
          ) : (
            <div className="divide-y">
              {best.map((item, idx) => (
                <ComparisonRow key={item.habitId} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Struggling */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-red-500" />
            <CardTitle className="text-base">Needs Attention</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Habits with lowest 30-day completion rate
          </p>
        </CardHeader>
        <CardContent>
          {struggling.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              All habits are performing well!
            </p>
          ) : (
            <div className="divide-y">
              {struggling.map((item, idx) => (
                <ComparisonRow key={item.habitId} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
