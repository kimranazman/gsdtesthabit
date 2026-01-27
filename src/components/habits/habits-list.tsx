"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableHabitCard } from "./sortable-habit-card";
import { HabitFormDialog } from "./habit-form-dialog";
import { reorderHabits } from "@/lib/actions/habits";
import type { Habit, Category } from "@/lib/db/schema";

interface HabitsListProps {
  initialHabits: Habit[];
  categories: Category[];
  selectedCategoryId?: string | null;
  externalFormOpen?: boolean;
  onExternalFormOpenChange?: (open: boolean) => void;
}

export function HabitsList({
  initialHabits,
  categories,
  selectedCategoryId,
  externalFormOpen,
  onExternalFormOpenChange,
}: HabitsListProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [internalFormOpen, setInternalFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [, startTransition] = useTransition();

  // Use external form state if provided, otherwise use internal
  const formOpen = externalFormOpen !== undefined ? externalFormOpen : internalFormOpen;
  const setFormOpen = onExternalFormOpenChange || setInternalFormOpen;

  // Sync with server data after revalidation
  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  const filteredHabits = selectedCategoryId
    ? habits.filter((h) => h.categoryId === selectedCategoryId)
    : habits;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setHabits((prev) => {
        const oldIndex = prev.findIndex((h) => h.id === active.id);
        const newIndex = prev.findIndex((h) => h.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const newOrder = arrayMove(prev, oldIndex, newIndex);

        // Persist to server
        startTransition(async () => {
          await reorderHabits(newOrder.map((h) => h.id));
        });

        return newOrder;
      });
    },
    [startTransition]
  );

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingHabit(null);
    }
  }

  function getCategoryForHabit(habit: Habit): Category | undefined {
    return categories.find((c) => c.id === habit.categoryId);
  }

  if (filteredHabits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New Habit
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ListChecks className="size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No habits yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedCategoryId
              ? "No habits in this category. Create one or change the filter."
              : "Create your first habit to start tracking."}
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Create Habit
          </Button>
        </div>

        <HabitFormDialog
          open={formOpen}
          onOpenChange={handleFormClose}
          habit={editingHabit}
          categories={categories}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredHabits.length} habit{filteredHabits.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New Habit
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={filteredHabits.map((h) => h.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {filteredHabits.map((habit) => (
              <SortableHabitCard
                key={habit.id}
                habit={habit}
                category={getCategoryForHabit(habit)}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <HabitFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        habit={editingHabit}
        categories={categories}
      />
    </div>
  );
}
