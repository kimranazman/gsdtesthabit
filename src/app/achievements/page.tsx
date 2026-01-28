import { getUserStats, getUnlockedAchievements } from "@/lib/actions/gamification";
import { getXpProgress, ACHIEVEMENTS } from "@/lib/gamification";
import { AchievementsClient } from "@/components/achievements/achievements-client";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const [stats, unlockedList] = await Promise.all([
    getUserStats(),
    getUnlockedAchievements(),
  ]);

  const progress = getXpProgress(stats.totalXp);

  // Build unlocked map: achievementId -> unlockedAt date
  const unlockedMap: Record<string, Date> = {};
  for (const item of unlockedList) {
    unlockedMap[item.achievement.id] = item.unlockedAt;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Unlock achievements by building habits and leveling up.
        </p>
      </div>

      <AchievementsClient
        achievements={ACHIEVEMENTS}
        unlockedMap={unlockedMap}
        stats={{
          level: progress.level,
          totalXp: stats.totalXp,
          xpIntoLevel: progress.xpIntoLevel,
          xpNeededForNext: progress.xpNeededForNext,
          progressPercent: progress.progressPercent,
          isMaxLevel: progress.isMaxLevel,
        }}
      />
    </div>
  );
}
