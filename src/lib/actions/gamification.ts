"use server";

import { db } from "@/lib/db";
import { userStats, userAchievements, completions, habits } from "@/lib/db/schema";
import type { UserStats } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import {
  calculateXpForCompletion,
  getLevelForXp,
  checkAchievements,
  ACHIEVEMENT_MAP,
  type AchievementCheckContext,
  type AchievementDefinition,
  type GamificationEvents,
} from "@/lib/gamification";
import { calculateStreaks } from "@/lib/stats";

// ---------------------------------------------------------------------------
// User Stats Management
// ---------------------------------------------------------------------------

/**
 * Get or create the single user stats row.
 * Since this is a single-user app, there's only one row.
 */
export async function getOrCreateUserStats(): Promise<UserStats> {
  const existing = await db.select().from(userStats).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create initial stats row
  const result = await db
    .insert(userStats)
    .values({
      totalXp: 0,
      level: 1,
    })
    .returning();

  return result[0];
}

/**
 * Get user stats (read-only, for display).
 */
export async function getUserStats(): Promise<UserStats> {
  return getOrCreateUserStats();
}

/**
 * Award XP and update level. Returns the updated stats and whether a level-up occurred.
 */
async function awardXp(
  stats: UserStats,
  amount: number
): Promise<{ updatedStats: UserStats; leveledUp: boolean; previousLevel: number }> {
  const previousLevel = stats.level;
  const newTotalXp = stats.totalXp + amount;
  const newLevel = getLevelForXp(newTotalXp);
  const leveledUp = newLevel > previousLevel;

  const result = await db
    .update(userStats)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(userStats.id, stats.id))
    .returning();

  return {
    updatedStats: result[0],
    leveledUp,
    previousLevel,
  };
}

// ---------------------------------------------------------------------------
// Achievement Management
// ---------------------------------------------------------------------------

/**
 * Get all unlocked achievement IDs.
 */
async function getUnlockedAchievementIds(): Promise<Set<string>> {
  const rows = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements);

  return new Set(rows.map((r) => r.achievementId));
}

/**
 * Unlock achievements by their IDs. Returns the full definitions of newly unlocked ones.
 */
async function unlockAchievements(
  achievementIds: string[]
): Promise<AchievementDefinition[]> {
  if (achievementIds.length === 0) return [];

  const unlocked: AchievementDefinition[] = [];

  for (const id of achievementIds) {
    const def = ACHIEVEMENT_MAP.get(id);
    if (!def) continue;

    await db
      .insert(userAchievements)
      .values({
        achievementId: id,
        metadata: { name: def.name },
      })
      .onConflictDoNothing();

    unlocked.push(def);
  }

  return unlocked;
}

/**
 * Get all unlocked achievements with their definitions.
 */
export async function getUnlockedAchievements(): Promise<
  { achievement: AchievementDefinition; unlockedAt: Date }[]
> {
  const rows = await db.select().from(userAchievements);

  return rows
    .map((row) => {
      const def = ACHIEVEMENT_MAP.get(row.achievementId);
      if (!def) return null;
      return { achievement: def, unlockedAt: row.unlockedAt };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

// ---------------------------------------------------------------------------
// Gamification Event Processing
// ---------------------------------------------------------------------------

/**
 * Process gamification events after a habit completion.
 * This is the main entry point called from toggleCompletion.
 *
 * @param habitId - The habit that was just completed
 * @param dateStr - The date of the completion (YYYY-MM-DD)
 * @returns GamificationEvents with all XP, level, and achievement info
 */
export async function processCompletionGamification(
  habitId: string,
  dateStr: string
): Promise<GamificationEvents> {
  // 1. Get user stats
  const stats = await getOrCreateUserStats();

  // 2. Get the habit and its completions for streak calculation
  const [habitRows, habitCompletions] = await Promise.all([
    db.select().from(habits).where(eq(habits.id, habitId)).limit(1),
    db
      .select({ completedDate: completions.completedDate })
      .from(completions)
      .where(eq(completions.habitId, habitId))
      .orderBy(completions.completedDate),
  ]);

  const habit = habitRows[0];
  if (!habit) {
    // Shouldn't happen, but return a default
    return {
      xpGained: 0,
      newTotalXp: stats.totalXp,
      newLevel: stats.level,
      leveledUp: false,
      previousLevel: stats.level,
      achievementsUnlocked: [],
    };
  }

  // 3. Calculate streak for XP bonus
  const completionDates = habitCompletions.map((c) => c.completedDate);
  const streakResult = calculateStreaks(habit, completionDates);

  // 4. Calculate XP to award
  const xpGained = calculateXpForCompletion(streakResult.currentStreak);

  // 5. Award XP
  const { updatedStats, leveledUp, previousLevel } = await awardXp(stats, xpGained);

  // 6. Gather achievement context
  const [
    alreadyUnlocked,
    totalCompletionsResult,
    totalHabitsResult,
    todayCompletionsResult,
  ] = await Promise.all([
    getUnlockedAchievementIds(),
    db
      .select({ count: count() })
      .from(completions),
    db
      .select({ count: count() })
      .from(habits)
      .where(eq(habits.archived, false)),
    db
      .select({ habitId: completions.habitId })
      .from(completions)
      .where(eq(completions.completedDate, dateStr))
      .groupBy(completions.habitId),
  ]);

  const achievementContext: AchievementCheckContext = {
    alreadyUnlocked,
    totalCompletions: totalCompletionsResult[0]?.count ?? 0,
    bestStreak: streakResult.bestStreak,
    currentStreak: streakResult.currentStreak,
    totalHabitsCreated: totalHabitsResult[0]?.count ?? 0,
    distinctHabitsCompletedToday: todayCompletionsResult.length,
    newLevel: updatedStats.level,
  };

  // 7. Check and unlock achievements
  const newAchievementIds = checkAchievements(achievementContext);
  const achievementsUnlocked = await unlockAchievements(newAchievementIds);

  return {
    xpGained,
    newTotalXp: updatedStats.totalXp,
    newLevel: updatedStats.level,
    leveledUp,
    previousLevel,
    achievementsUnlocked,
  };
}

/**
 * Process gamification events after creating a habit.
 * Checks habit-creation-related achievements only.
 */
export async function processHabitCreationGamification(): Promise<{
  achievementsUnlocked: AchievementDefinition[];
}> {
  const [alreadyUnlocked, totalHabitsResult] = await Promise.all([
    getUnlockedAchievementIds(),
    db
      .select({ count: count() })
      .from(habits)
      .where(eq(habits.archived, false)),
  ]);

  // We only need to check variety achievements for habit creation
  const stats = await getOrCreateUserStats();

  const achievementContext: AchievementCheckContext = {
    alreadyUnlocked,
    totalCompletions: 0, // Not relevant for habit creation
    bestStreak: 0,
    currentStreak: 0,
    totalHabitsCreated: totalHabitsResult[0]?.count ?? 0,
    distinctHabitsCompletedToday: 0,
    newLevel: stats.level,
  };

  const newAchievementIds = checkAchievements(achievementContext);
  // Filter to only variety achievements (habit-creator, collector)
  const relevantIds = newAchievementIds.filter(
    (id) => id === "habit-creator" || id === "collector"
  );
  const achievementsUnlocked = await unlockAchievements(relevantIds);

  return { achievementsUnlocked };
}
