"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeatmapCalendar } from "./heatmap-calendar";
import { HabitStreakCard, OverallStatsCards } from "./streak-display";
import { WeeklySummaryView } from "./weekly-summary";
import { MonthlySummaryView } from "./monthly-summary";
import { TrendChart } from "./trend-chart";
import { HabitComparison } from "./habit-comparison";
import { DayOfWeekChart } from "./day-of-week-chart";
import {
  calculateStreaks,
  calculateCompletionRate,
  generateWeeklySummaries,
  generateMonthlySummaries,
  generateTrendData,
  calculateHabitComparison,
  calculateDayOfWeekPatterns,
} from "@/lib/stats";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/components/motion";
import type { Habit, Completion } from "@/lib/db/schema";

interface AnalyticsClientProps {
  habits: Habit[];
  completions: Completion[];
}

export function AnalyticsClient({ habits, completions }: AnalyticsClientProps) {
  const today = useMemo(() => new Date(), []);

  // Group completions by habit
  const completionsByHabit = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of completions) {
      if (!map.has(c.habitId)) {
        map.set(c.habitId, []);
      }
      map.get(c.habitId)!.push(c.completedDate);
    }
    // Sort each habit's dates ascending
    for (const [, dates] of map) {
      dates.sort();
    }
    return map;
  }, [completions]);

  // All completion dates (for heatmap)
  const allCompletionDates = useMemo(
    () => completions.map((c) => c.completedDate),
    [completions]
  );

  // Flat completion records for stats functions
  const completionRecords = useMemo(
    () =>
      completions.map((c) => ({
        habitId: c.habitId,
        completedDate: c.completedDate,
      })),
    [completions]
  );

  // Per-habit stats
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const dates = completionsByHabit.get(habit.id) || [];
      const streak = calculateStreaks(habit, dates, today);
      const rate7d = calculateCompletionRate(habit, dates, 7, today);
      const rate30d = calculateCompletionRate(habit, dates, 30, today);
      const rateAll = calculateCompletionRate(habit, dates, "all", today);
      return { habit, streak, rate7d, rate30d, rateAll };
    });
  }, [habits, completionsByHabit, today]);

  // Overall stats
  const overallStats = useMemo(() => {
    let totalExpected7d = 0;
    let totalCompleted7d = 0;
    let bestStreakHabit: { name: string; streak: number } | null = null;

    for (const { habit, streak, rate7d } of habitStats) {
      totalExpected7d += rate7d.expected;
      totalCompleted7d += rate7d.completed;
      if (
        !bestStreakHabit ||
        streak.bestStreak > bestStreakHabit.streak
      ) {
        bestStreakHabit = { name: habit.name, streak: streak.bestStreak };
      }
    }

    const overallRate7d =
      totalExpected7d > 0
        ? Math.round((totalCompleted7d / totalExpected7d) * 100)
        : 0;

    return {
      totalHabits: habits.length,
      totalCompletions: completions.length,
      overallRate7d,
      bestStreakHabit:
        bestStreakHabit && bestStreakHabit.streak > 0
          ? bestStreakHabit
          : null,
    };
  }, [habitStats, habits.length, completions.length]);

  // Weekly and monthly summaries
  const weeklySummaries = useMemo(
    () => generateWeeklySummaries(habits, completionRecords, 8, today),
    [habits, completionRecords, today]
  );

  const monthlySummaries = useMemo(
    () => generateMonthlySummaries(habits, completionRecords, 6, today),
    [habits, completionRecords, today]
  );

  // Trend data (12 weeks)
  const trendData = useMemo(
    () => generateTrendData(habits, completionRecords, 12, today),
    [habits, completionRecords, today]
  );

  // Habit comparison (best vs struggling)
  const habitComparison = useMemo(
    () => calculateHabitComparison(habits, completionRecords, 3, today),
    [habits, completionRecords, today]
  );

  // Day-of-week patterns (90 days)
  const dayOfWeekData = useMemo(
    () => calculateDayOfWeekPatterns(habits, completionRecords, 90, today),
    [habits, completionRecords, today]
  );

  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  if (habits.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        variants={noMotion ? undefined : fadeInUpVariants}
        initial={noMotion ? undefined : "hidden"}
        animate={noMotion ? undefined : "visible"}
      >
        <p className="text-muted-foreground">
          No active habits yet. Create some habits to see your analytics.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={noMotion ? undefined : staggerContainerVariants}
      initial={noMotion ? undefined : "hidden"}
      animate={noMotion ? undefined : "visible"}
    >
      {/* Overall Stats */}
      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <OverallStatsCards {...overallStats} />
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <HeatmapCalendar completionDates={allCompletionDates} />
      </motion.div>

      {/* Tabs: Habits | Trends | Insights | Weekly | Monthly */}
      <motion.div variants={noMotion ? undefined : staggerItemVariants}>
        <Tabs defaultValue="trends">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="habits">Habit Streaks</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trends" className="mt-4">
            <motion.div
              initial={noMotion ? undefined : { opacity: 0, y: 10 }}
              animate={noMotion ? undefined : { opacity: 1, y: 0 }}
              transition={noMotion ? undefined : { type: "tween", duration: 0.35, ease: "easeOut" }}
            >
              <TrendChart data={trendData} />
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4 space-y-6">
            <motion.div
              initial={noMotion ? undefined : { opacity: 0, y: 10 }}
              animate={noMotion ? undefined : { opacity: 1, y: 0 }}
              transition={noMotion ? undefined : { type: "tween", duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              <HabitComparison
                best={habitComparison.best}
                struggling={habitComparison.struggling}
              />
              <DayOfWeekChart data={dayOfWeekData} />
            </motion.div>
          </TabsContent>

          <TabsContent value="habits" className="mt-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={noMotion ? undefined : {
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
              initial={noMotion ? undefined : "hidden"}
              animate={noMotion ? undefined : "visible"}
            >
              {habitStats.map(({ habit, streak, rate7d, rate30d, rateAll }) => (
                <motion.div
                  key={habit.id}
                  variants={noMotion ? undefined : staggerItemVariants}
                >
                  <HabitStreakCard
                    habit={habit}
                    streak={streak}
                    rate7d={rate7d}
                    rate30d={rate30d}
                    rateAll={rateAll}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <motion.div
              initial={noMotion ? undefined : { opacity: 0, y: 10 }}
              animate={noMotion ? undefined : { opacity: 1, y: 0 }}
              transition={noMotion ? undefined : { type: "tween", duration: 0.35, ease: "easeOut" }}
            >
              <WeeklySummaryView summaries={weeklySummaries} />
            </motion.div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <motion.div
              initial={noMotion ? undefined : { opacity: 0, y: 10 }}
              animate={noMotion ? undefined : { opacity: 1, y: 0 }}
              transition={noMotion ? undefined : { type: "tween", duration: 0.35, ease: "easeOut" }}
            >
              <MonthlySummaryView summaries={monthlySummaries} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
