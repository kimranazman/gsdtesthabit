import { format } from "date-fns";
import { getTodaysHabitsWithCompletions, getCompletionsForHabit } from "@/lib/db/queries";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { calculateStreaks } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const habits = await getTodaysHabitsWithCompletions(dateStr);

  // Fetch streaks for each habit
  const streakMap: Record<string, { currentStreak: number; bestStreak: number }> = {};
  await Promise.all(
    habits.map(async (habit) => {
      const completions = await getCompletionsForHabit(habit.id);
      const dates = completions.map((c) => c.completedDate).sort();
      streakMap[habit.id] = calculateStreaks(habit, dates, today);
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your daily habits and build streaks.
        </p>
      </div>

      <DashboardClient
        habits={habits}
        dateStr={dateStr}
        formattedDate={formattedDate}
        streakMap={streakMap}
      />
    </div>
  );
}
