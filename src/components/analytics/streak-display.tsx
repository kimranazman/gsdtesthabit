"use client";

import { Flame, Trophy, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HabitIcon } from "@/components/habits/habit-icon";
import { motion, useReducedMotion } from "framer-motion";
import { staggerItemVariants } from "@/components/motion";
import type { Habit } from "@/lib/db/schema";
import type { StreakResult, CompletionRateResult } from "@/lib/stats";

interface HabitStreakCardProps {
  habit: Habit;
  streak: StreakResult;
  rate7d: CompletionRateResult;
  rate30d: CompletionRateResult;
  rateAll: CompletionRateResult;
}

export function HabitStreakCard({
  habit,
  streak,
  rate7d,
  rate30d,
  rateAll,
}: HabitStreakCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {/* Habit header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: habit.color + "20", color: habit.color }}
          >
            <HabitIcon name={habit.icon} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{habit.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {habit.frequency}
              {habit.frequency === "weekly" && " (once per week)"}
            </p>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3">
            <Flame className="size-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold tabular-nums leading-none">
                {streak.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current streak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
            <Trophy className="size-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold tabular-nums leading-none">
                {streak.bestStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Best streak
              </p>
            </div>
          </div>
        </div>

        {/* Completion rates */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Completion Rate
          </p>
          <div className="grid grid-cols-3 gap-2">
            <RatePill label="7 days" rate={rate7d} />
            <RatePill label="30 days" rate={rate30d} />
            <RatePill label="All time" rate={rateAll} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RatePill({
  label,
  rate,
}: {
  label: string;
  rate: CompletionRateResult;
}) {
  const color =
    rate.percentage >= 80
      ? "text-green-600 dark:text-green-400"
      : rate.percentage >= 50
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-500 dark:text-red-400";

  return (
    <div className="text-center rounded-lg border p-2">
      <p className={`text-lg font-bold tabular-nums ${color}`}>
        {rate.percentage}%
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">
        {rate.completed}/{rate.expected}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overall stats cards (top-level summary)
// ---------------------------------------------------------------------------

interface OverallStatsProps {
  totalHabits: number;
  totalCompletions: number;
  overallRate7d: number; // percentage
  bestStreakHabit: { name: string; streak: number } | null;
}

export function OverallStatsCards({
  totalHabits,
  totalCompletions,
  overallRate7d,
  bestStreakHabit,
}: OverallStatsProps) {
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      variants={noMotion ? undefined : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.02 },
        },
      }}
      initial={noMotion ? undefined : "hidden"}
      animate={noMotion ? undefined : "visible"}
    >
      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Habits</span>
            </div>
            <p className="text-3xl font-bold tabular-nums">{totalHabits}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Completions
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums">{totalCompletions}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">7-Day Rate</span>
            </div>
            <p
              className={`text-3xl font-bold tabular-nums ${
                overallRate7d >= 80
                  ? "text-green-600 dark:text-green-400"
                  : overallRate7d >= 50
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-500 dark:text-red-400"
              }`}
            >
              {overallRate7d}%
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
            {bestStreakHabit ? (
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {bestStreakHabit.streak}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {bestStreakHabit.name}
                </p>
              </div>
            ) : (
              <p className="text-3xl font-bold tabular-nums text-muted-foreground">
                --
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
