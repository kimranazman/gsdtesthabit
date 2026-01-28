import { format } from "date-fns";
import { getTodaysHabitsWithCompletions, getCompletionsForHabit } from "@/lib/db/queries";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { calculateStreaks } from "@/lib/stats";
import { getUserStats } from "@/lib/actions/gamification";
import { getXpProgress, STREAK_BONUS_MULTIPLIER } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const [habits, stats] = await Promise.all([
    getTodaysHabitsWithCompletions(dateStr),
    getUserStats(),
  ]);

  // Fetch streaks for each habit
  const streakMap: Record<string, { currentStreak: number; bestStreak: number }> = {};
  let bestCurrentStreak = 0;
  await Promise.all(
    habits.map(async (habit) => {
      const completions = await getCompletionsForHabit(habit.id);
      const dates = completions.map((c) => c.completedDate).sort();
      const streakData = calculateStreaks(habit, dates, today);
      streakMap[habit.id] = streakData;
      if (streakData.currentStreak > bestCurrentStreak) {
        bestCurrentStreak = streakData.currentStreak;
      }
    })
  );

  const progress = getXpProgress(stats.totalXp);
  const streakBonus = bestCurrentStreak * STREAK_BONUS_MULTIPLIER;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your daily habits and build streaks.
        </p>
      </div>

      <DashboardClient
        habits={habits}
        dateStr={dateStr}
        formattedDate={formattedDate}
        streakMap={streakMap}
        gamificationStats={{
          level: progress.level,
          totalXp: stats.totalXp,
          xpIntoLevel: progress.xpIntoLevel,
          xpNeededForNext: progress.xpNeededForNext,
          progressPercent: progress.progressPercent,
          isMaxLevel: progress.isMaxLevel,
          streakBonus,
          bestCurrentStreak,
        }}
      />
    </div>
  );
}
