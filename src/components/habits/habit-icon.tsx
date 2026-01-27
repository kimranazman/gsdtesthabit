"use client";

import {
  CircleCheck,
  Dumbbell,
  BookOpen,
  Brain,
  Heart,
  Droplets,
  Moon,
  Sun,
  Apple,
  Bike,
  Coffee,
  Pencil,
  Music,
  Camera,
  Code,
  Leaf,
  Flame,
  Footprints,
  Pill,
  Smile,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "circle-check": CircleCheck,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  brain: Brain,
  heart: Heart,
  droplets: Droplets,
  moon: Moon,
  sun: Sun,
  apple: Apple,
  bike: Bike,
  coffee: Coffee,
  pencil: Pencil,
  music: Music,
  camera: Camera,
  code: Code,
  leaf: Leaf,
  flame: Flame,
  footprints: Footprints,
  pill: Pill,
  smile: Smile,
  star: Star,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

interface HabitIconProps extends LucideProps {
  name: string;
}

export function HabitIcon({ name, ...props }: HabitIconProps) {
  const Icon = iconMap[name] ?? CircleCheck;
  return <Icon {...props} />;
}

export { iconMap };
