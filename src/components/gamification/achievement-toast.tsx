"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AchievementIcon } from "@/components/gamification/achievement-icon";
import type { AchievementDefinition } from "@/lib/gamification";

interface AchievementToastProps {
  achievements: AchievementDefinition[];
  onDismiss: (id: string) => void;
}

/**
 * Animated toast notifications for achievement unlocks.
 * Stacks from top-right, auto-dismisses after 4 seconds.
 */
export function AchievementToasts({
  achievements,
  onDismiss,
}: AchievementToastProps) {
  return (
    <div className="fixed top-16 right-4 z-[90] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {achievements.map((achievement) => (
          <AchievementToastItem
            key={achievement.id}
            achievement={achievement}
            onDismiss={() => onDismiss(achievement.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AchievementToastItem({
  achievement,
  onDismiss,
}: {
  achievement: AchievementDefinition;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-lg cursor-pointer"
      onClick={onDismiss}
      onAnimationComplete={() => {
        // Auto-dismiss after 4 seconds
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
      }}
    >
      {/* Icon with glow */}
      <motion.div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(251, 191, 36, 0)",
            "0 0 12px 4px rgba(251, 191, 36, 0.3)",
            "0 0 0 0 rgba(251, 191, 36, 0)",
          ],
        }}
        transition={{ duration: 1.5, repeat: 1 }}
      >
        <AchievementIcon name={achievement.icon} className="size-5 text-amber-600 dark:text-amber-400" />
      </motion.div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Achievement Unlocked!
        </p>
        <p className="font-medium text-sm truncate">{achievement.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {achievement.description}
        </p>
      </div>
    </motion.div>
  );
}
