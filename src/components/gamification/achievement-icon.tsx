"use client";

import {
  Flame,
  Swords,
  Shield,
  Crown,
  Trophy,
  Footprints,
  Rocket,
  Star,
  Medal,
  Cog,
  PlusCircle,
  Layers,
  Sparkles,
  ArrowUp,
  Zap,
  Gem,
  Lock,
  type LucideProps,
} from "lucide-react";

const achievementIconMap: Record<string, React.ComponentType<LucideProps>> = {
  flame: Flame,
  sword: Swords,
  shield: Shield,
  crown: Crown,
  trophy: Trophy,
  footprints: Footprints,
  rocket: Rocket,
  star: Star,
  medal: Medal,
  cog: Cog,
  "plus-circle": PlusCircle,
  layers: Layers,
  sparkles: Sparkles,
  "arrow-up": ArrowUp,
  zap: Zap,
  gem: Gem,
};

interface AchievementIconProps extends LucideProps {
  name: string;
  locked?: boolean;
}

export function AchievementIcon({ name, locked, ...props }: AchievementIconProps) {
  if (locked) {
    return <Lock {...props} />;
  }
  const Icon = achievementIconMap[name] ?? Trophy;
  return <Icon {...props} />;
}
