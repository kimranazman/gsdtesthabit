"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HabitCard } from "./habit-card";
import type { Habit, Category } from "@/lib/db/schema";

interface SortableHabitCardProps {
  habit: Habit;
  category?: Category | null;
  onEdit: (habit: Habit) => void;
}

export function SortableHabitCard({
  habit,
  category,
  onEdit,
}: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HabitCard
        habit={habit}
        category={category}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
