"use client";

import { useState, useCallback } from "react";
import { HabitsList } from "./habits-list";
import { CategoryManager } from "./category-manager";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { Habit, Category } from "@/lib/db/schema";

interface HabitsPageClientProps {
  habits: Habit[];
  categories: Category[];
}

export function HabitsPageClient({
  habits,
  categories,
}: HabitsPageClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [formOpen, setFormOpen] = useState(false);

  const openNewHabitForm = useCallback(() => setFormOpen(true), []);

  // Keyboard shortcut: "n" to open new habit dialog
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "n",
        description: "New habit",
        handler: openNewHabitForm,
      },
    ],
  });

  return (
    <div className="space-y-4 animate-in fade-in-0 duration-300">
      {/* Category filter bar */}
      <CategoryManager
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Habits list with drag-and-drop */}
      <HabitsList
        initialHabits={habits}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        externalFormOpen={formOpen}
        onExternalFormOpenChange={setFormOpen}
      />
    </div>
  );
}
