// Preset colors for habits
export const HABIT_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Green", value: "#22c55e" },
  { label: "Yellow", value: "#eab308" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#ef4444" },
  { label: "Pink", value: "#ec4899" },
  { label: "Purple", value: "#a855f7" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Slate", value: "#64748b" },
] as const;

// Curated list of lucide icons for habits
export const HABIT_ICONS = [
  "circle-check",
  "dumbbell",
  "book-open",
  "brain",
  "heart",
  "droplets",
  "moon",
  "sun",
  "apple",
  "bike",
  "coffee",
  "pencil",
  "music",
  "camera",
  "code",
  "leaf",
  "flame",
  "footprints",
  "pill",
  "smile",
  "star",
  "target",
  "trophy",
  "zap",
] as const;

export const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Custom Days", value: "custom" },
] as const;

export const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
] as const;
