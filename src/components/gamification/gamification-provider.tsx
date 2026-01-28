"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ConfettiCelebration } from "./confetti";
import { AchievementToasts } from "./achievement-toast";
import type { AchievementDefinition, GamificationEvents } from "@/lib/gamification";

interface GamificationContextValue {
  /** Trigger all gamification effects from a completion result */
  triggerGamificationEvents: (events: GamificationEvents) => void;
  /** Show a level-up celebration */
  showLevelUp: (level: number) => void;
  /** Show achievement unlock toasts */
  showAchievements: (achievements: AchievementDefinition[]) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return ctx;
}

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  // Level-up state
  const [levelUpState, setLevelUpState] = useState<{
    show: boolean;
    level: number;
  }>({ show: false, level: 1 });

  // Achievement toasts state
  const [toastAchievements, setToastAchievements] = useState<
    AchievementDefinition[]
  >([]);

  const showLevelUp = useCallback((level: number) => {
    setLevelUpState({ show: true, level });
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpState((prev) => ({ ...prev, show: false }));
  }, []);

  const showAchievements = useCallback(
    (achievements: AchievementDefinition[]) => {
      setToastAchievements((prev) => [...prev, ...achievements]);
    },
    []
  );

  const dismissAchievement = useCallback((id: string) => {
    setToastAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const triggerGamificationEvents = useCallback(
    (events: GamificationEvents) => {
      // Show level-up celebration first
      if (events.leveledUp) {
        showLevelUp(events.newLevel);
      }

      // Show achievement toasts (with slight delay if level-up is also happening)
      if (events.achievementsUnlocked.length > 0) {
        const delay = events.leveledUp ? 1500 : 0;
        setTimeout(() => {
          showAchievements(events.achievementsUnlocked);
        }, delay);
      }
    },
    [showLevelUp, showAchievements]
  );

  return (
    <GamificationContext.Provider
      value={{
        triggerGamificationEvents,
        showLevelUp,
        showAchievements,
      }}
    >
      {children}

      {/* Level-up celebration overlay */}
      <ConfettiCelebration
        show={levelUpState.show}
        level={levelUpState.level}
        onComplete={dismissLevelUp}
      />

      {/* Achievement toast container */}
      <AchievementToasts
        achievements={toastAchievements}
        onDismiss={dismissAchievement}
      />
    </GamificationContext.Provider>
  );
}
