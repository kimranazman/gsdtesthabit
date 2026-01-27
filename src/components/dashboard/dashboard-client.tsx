"use client";

import { Activity, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCheckItem } from "./habit-check-item";
import Link from "next/link";
import { useRef } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { HabitWithCompletion } from "@/lib/db/queries";

interface DashboardClientProps {
  habits: HabitWithCompletion[];
  dateStr: string;
  formattedDate: string;
  streakMap?: Record<string, { currentStreak: number; bestStreak: number }>;
}

export function DashboardClient({
  habits,
  dateStr,
  formattedDate,
  streakMap,
}: DashboardClientProps) {
  const completedCount = habits.filter((h) => h.completion !== null).length;
  const totalCount = habits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Refs for habit toggle buttons (1-9 keyboard shortcuts)
  const habitToggleRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Keyboard shortcuts: press 1-9 to toggle habit completion
  useKeyboardShortcuts({
    shortcuts: Array.from({ length: Math.min(habits.length, 9) }, (_, i) => ({
      key: String(i + 1),
      description: `Toggle habit ${i + 1}`,
      handler: () => {
        const btn = habitToggleRefs.current.get(i);
        if (btn) btn.click();
      },
    })),
    disabled: totalCount === 0,
  });

  if (totalCount === 0) {
    return (
      <Card className="animate-in fade-in-0 duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Today&apos;s Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Circle className="size-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">
              No habits scheduled for today. Create some habits to get started!
            </p>
            <Button asChild>
              <Link href="/habits">
                Go to Habits
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-12 items-center justify-center rounded-full transition-colors duration-500 ${
                  allDone
                    ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {allDone ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Activity className="size-6" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
                <p className="text-lg font-semibold">
                  {allDone ? (
                    "All done! Great job!"
                  ) : (
                    <>
                      {completedCount} of {totalCount} completed
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums">
                {progressPercent}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                allDone ? "bg-green-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Habit Checklist */}
      <div>
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Activity className="size-5" />
          Today&apos;s Habits
        </h2>
        <div className="space-y-2 animate-stagger">
          {habits.map((habit, index) => (
            <HabitCheckItem
              key={habit.id}
              habit={habit}
              dateStr={dateStr}
              currentStreak={streakMap?.[habit.id]?.currentStreak}
              index={index}
              onToggleRef={(ref) => {
                if (ref) {
                  habitToggleRefs.current.set(index, ref);
                } else {
                  habitToggleRefs.current.delete(index);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
