"use client";

import { Activity, CheckCircle2, Circle, ArrowRight, Zap, Flame, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitCheckItem } from "./habit-check-item";
import { DateNavigator } from "./date-navigator";
import Link from "next/link";
import { useRef, useState, useCallback, useTransition } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  staggerContainerVariants,
  staggerItemVariants,
  fadeInUpVariants,
  scaleInVariants,
} from "@/components/motion";
import { getHabitsForDate } from "@/lib/actions/completions";
import type { HabitWithCompletion } from "@/lib/db/queries";

interface GamificationStats {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
  streakBonus: number;
  bestCurrentStreak: number;
}

interface DashboardClientProps {
  habits: HabitWithCompletion[];
  dateStr: string;
  formattedDate: string;
  streakMap?: Record<string, { currentStreak: number; bestStreak: number }>;
  gamificationStats?: GamificationStats;
}

/** Format a date as "Today", "Yesterday", or "EEEE, MMMM d, yyyy" */
function formatDateLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return "Today";

  const target = new Date(dateStr + "T12:00:00");
  const today = new Date(todayStr + "T12:00:00");
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateStr === yesterdayStr) return "Yesterday";

  // Format: "Wednesday, January 28, 2026"
  return target.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Slide direction variants for day navigation
const slideVariants = {
  enterFromRight: { x: 60, opacity: 0 },
  enterFromLeft: { x: -60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitToLeft: { x: -60, opacity: 0 },
  exitToRight: { x: 60, opacity: 0 },
};

export function DashboardClient({
  habits: initialHabits,
  dateStr: initialDateStr,
  formattedDate: _initialFormattedDate,
  streakMap: initialStreakMap,
  gamificationStats,
}: DashboardClientProps) {
  // Date navigation state
  const todayStr = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(initialDateStr);
  const [habits, setHabits] = useState(initialHabits);
  const [streakMap, setStreakMap] = useState(initialStreakMap);
  const [isLoading, startTransition] = useTransition();
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const isToday = selectedDate === todayStr;
  const formattedDate = formatDateLabel(selectedDate, todayStr);
  const canGoForward = selectedDate < todayStr;

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

  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  // Navigate to a specific date
  const navigateToDate = useCallback(
    (newDateStr: string, direction: "left" | "right") => {
      if (newDateStr === selectedDate) return;
      setSlideDirection(direction);
      setSelectedDate(newDateStr);

      startTransition(async () => {
        try {
          const result = await getHabitsForDate(newDateStr);
          setHabits(result.habits);
          setStreakMap(result.streakMap);
        } catch {
          // On error, revert
          setSelectedDate(selectedDate);
          setHabits(habits);
          setStreakMap(streakMap);
        }
      });
    },
    [selectedDate, habits, streakMap]
  );

  const handlePrevDay = useCallback(() => {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() - 1);
    navigateToDate(toDateStr(current), "right");
  }, [selectedDate, navigateToDate]);

  const handleNextDay = useCallback(() => {
    if (!canGoForward) return;
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + 1);
    const newDate = toDateStr(current);
    if (newDate <= todayStr) {
      navigateToDate(newDate, "left");
    }
  }, [selectedDate, canGoForward, todayStr, navigateToDate]);

  const handleGoToToday = useCallback(() => {
    navigateToDate(todayStr, "left");
  }, [todayStr, navigateToDate]);

  // Keyboard shortcuts for day navigation
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "ArrowLeft",
        description: "Previous day",
        handler: handlePrevDay,
      },
      {
        key: "ArrowRight",
        description: "Next day",
        handler: handleNextDay,
      },
      {
        key: "t",
        description: "Go to today",
        handler: handleGoToToday,
      },
    ],
    disabled: false,
  });

  if (totalCount === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <DateNavigator
          formattedDate={formattedDate}
          isToday={isToday}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onGoToToday={handleGoToToday}
          canGoForward={canGoForward}
        />
        <motion.div
          variants={noMotion ? undefined : scaleInVariants}
          initial={noMotion ? undefined : "hidden"}
          animate={noMotion ? undefined : "visible"}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                {isToday ? "Today's Habits" : "Habits"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Circle className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isToday
                    ? "No habits scheduled for today. Create some habits to get started!"
                    : "No habits scheduled for this day."}
                </p>
                {isToday && (
                  <Button asChild>
                    <Link href="/habits">
                      Go to Habits
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigator */}
      <DateNavigator
        formattedDate={formattedDate}
        isToday={isToday}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onGoToToday={handleGoToToday}
        canGoForward={canGoForward}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[1px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="size-6 border-2 border-primary border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated content with slide transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedDate}
          className="space-y-6"
          initial={
            noMotion
              ? undefined
              : slideDirection === "left"
                ? slideVariants.enterFromRight
                : slideVariants.enterFromLeft
          }
          animate={noMotion ? undefined : slideVariants.center}
          exit={
            noMotion
              ? undefined
              : slideDirection === "left"
                ? slideVariants.exitToLeft
                : slideVariants.exitToRight
          }
          transition={
            noMotion
              ? undefined
              : { type: "tween", duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
          }
        >
          {/* Progress Summary */}
          <motion.div
            variants={noMotion ? undefined : scaleInVariants}
            initial={noMotion ? undefined : "hidden"}
            animate={noMotion ? undefined : "visible"}
          >
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
          </motion.div>

          {/* Daily XP Summary */}
          {gamificationStats && isToday && (
            <motion.div
              variants={noMotion ? undefined : scaleInVariants}
              initial={noMotion ? undefined : "hidden"}
              animate={noMotion ? undefined : "visible"}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-white shadow-sm">
                        {gamificationStats.level}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Level {gamificationStats.level}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {gamificationStats.totalXp.toLocaleString()} total XP
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {gamificationStats.bestCurrentStreak > 0 && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Flame className="size-4 text-orange-500" />
                          <span className="font-medium">
                            +{gamificationStats.streakBonus} XP
                          </span>
                          <span className="hidden sm:inline text-xs text-muted-foreground">
                            streak bonus
                          </span>
                        </div>
                      )}
                      <Link href="/achievements">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Trophy className="size-3.5" />
                          <span className="hidden sm:inline">Achievements</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {/* XP progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {gamificationStats.isMaxLevel
                          ? "MAX LEVEL"
                          : `${gamificationStats.xpIntoLevel} / ${gamificationStats.xpNeededForNext} XP to Level ${gamificationStats.level + 1}`}
                      </span>
                      <span>{gamificationStats.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${gamificationStats.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Habit Checklist */}
          <div>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Activity className="size-5" />
              {isToday ? "Today's Habits" : "Habits"}
              {!isToday && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({formattedDate})
                </span>
              )}
            </h2>
            <motion.div
              className="space-y-2"
              variants={noMotion ? undefined : staggerContainerVariants}
              initial={noMotion ? undefined : "hidden"}
              animate={noMotion ? undefined : "visible"}
            >
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  variants={noMotion ? undefined : staggerItemVariants}
                >
                  <HabitCheckItem
                    habit={habit}
                    dateStr={selectedDate}
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
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Swipe hint for mobile (shown briefly on first visit) */}
          <p className="text-center text-xs text-muted-foreground/60 md:hidden">
            Swipe right to complete &bull; Swipe left for actions &bull; Swipe date to navigate
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
