"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementCard } from "./achievement-card";
import { XpBar } from "@/components/gamification/xp-bar";
import type { AchievementDefinition, AchievementCategory } from "@/lib/gamification";

interface AchievementsClientProps {
  achievements: AchievementDefinition[];
  unlockedMap: Record<string, Date>; // achievementId -> unlockedAt
  stats: {
    level: number;
    totalXp: number;
    xpIntoLevel: number;
    xpNeededForNext: number;
    progressPercent: number;
    isMaxLevel: boolean;
  };
}

const CATEGORY_ORDER: { key: AchievementCategory; label: string }[] = [
  { key: "streak", label: "Streaks" },
  { key: "completion", label: "Completions" },
  { key: "variety", label: "Variety" },
  { key: "level", label: "Levels" },
];

export function AchievementsClient({
  achievements,
  unlockedMap,
  stats,
}: AchievementsClientProps) {
  const totalUnlocked = Object.keys(unlockedMap).length;
  const totalAchievements = achievements.length;

  // Group achievements by category
  const grouped = new Map<AchievementCategory, AchievementDefinition[]>();
  for (const a of achievements) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Level badge large */}
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-extrabold text-white shadow-lg">
                  {stats.level}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level {stats.level}</p>
                  <p className="text-xl font-bold">{stats.totalXp.toLocaleString()} XP</p>
                  <XpBar
                    level={stats.level}
                    xpIntoLevel={stats.xpIntoLevel}
                    xpNeededForNext={stats.xpNeededForNext}
                    progressPercent={stats.progressPercent}
                    isMaxLevel={stats.isMaxLevel}
                    totalXp={stats.totalXp}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Achievement counter */}
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
                <Trophy className="size-5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold">
                    {totalUnlocked} / {totalAchievements}
                  </p>
                  <p className="text-xs text-muted-foreground">Unlocked</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement categories */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped.get(cat.key) ?? [];
        if (items.length === 0) return null;

        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.1,
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {items.map((achievement, i) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={achievement.id in unlockedMap}
                      unlockedAt={unlockedMap[achievement.id] ?? undefined}
                      index={i}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
