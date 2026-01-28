"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Check, FileText, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Thresholds
const COMPLETE_THRESHOLD = 100; // px to the right to trigger completion
const ACTION_REVEAL_THRESHOLD = -60; // px to the left to reveal actions
const ACTION_SNAP_X = -120; // px to snap to when actions are revealed
const MAX_DRAG_RIGHT = 160; // max right drag distance
const MAX_DRAG_LEFT = -160; // max left drag distance

interface SwipeableHabitCardProps {
  children: ReactNode;
  isCompleted: boolean;
  onComplete: () => void | Promise<void>;
  onOpenNotes: () => void;
  onUndoComplete: () => void | Promise<void>;
  className?: string;
}

export function SwipeableHabitCard({
  children,
  isCompleted,
  onComplete,
  onOpenNotes,
  onUndoComplete,
  className,
}: SwipeableHabitCardProps) {
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCompleteSweep, setShowCompleteSweep] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transforms for visual feedback
  // Right swipe: green background opacity increases as user drags right
  const rightBgOpacity = useTransform(x, [0, COMPLETE_THRESHOLD], [0, 1]);
  const rightCheckScale = useTransform(x, [0, COMPLETE_THRESHOLD], [0.3, 1]);
  const rightCheckOpacity = useTransform(x, [0, 40, COMPLETE_THRESHOLD], [0, 0.5, 1]);

  // Left swipe: action buttons slide in from the right
  const leftBgOpacity = useTransform(x, [ACTION_SNAP_X, 0], [1, 0]);
  const actionButtonsX = useTransform(x, [ACTION_SNAP_X, 0], [0, 80]);

  // Color shift on drag threshold: card border color changes
  const borderColor = useTransform(
    x,
    [MAX_DRAG_LEFT, ACTION_REVEAL_THRESHOLD, 0, COMPLETE_THRESHOLD * 0.8, COMPLETE_THRESHOLD],
    [
      "rgba(59, 130, 246, 0.3)", // blue (left)
      "rgba(59, 130, 246, 0.2)", // subtle blue
      "rgba(0, 0, 0, 0)",       // transparent (neutral)
      "rgba(34, 197, 94, 0.2)", // subtle green
      "rgba(34, 197, 94, 0.5)", // green (threshold reached)
    ]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (_: unknown, info: PanInfo) => {
      setIsDragging(false);
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;

      // Right swipe past threshold -> complete habit
      if (
        !isCompleted &&
        (offsetX > COMPLETE_THRESHOLD || (offsetX > COMPLETE_THRESHOLD * 0.7 && velocityX > 500))
      ) {
        // Show sweep animation
        setShowCompleteSweep(true);

        // First snap the card back to origin position so it doesn't stay off-screen
        await controls.start({
          x: 0,
          transition: { type: "spring", stiffness: 400, damping: 35 },
        });

        // Clear the sweep overlay after the animation completes
        setShowCompleteSweep(false);

        // Now trigger the completion callback (server action)
        onComplete();
        return;
      }

      // Left swipe past threshold -> reveal action buttons
      if (
        offsetX < ACTION_REVEAL_THRESHOLD ||
        (offsetX < ACTION_REVEAL_THRESHOLD * 0.5 && velocityX < -300)
      ) {
        setIsRevealed(true);
        await controls.start({
          x: ACTION_SNAP_X,
          transition: { type: "spring", stiffness: 400, damping: 35 },
        });
        return;
      }

      // Otherwise, spring back to origin
      setIsRevealed(false);
      await controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    },
    [isCompleted, onComplete, controls]
  );

  const handleActionClick = useCallback(
    async (action: "notes" | "undo") => {
      // Close the revealed panel
      setIsRevealed(false);
      await controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });

      if (action === "notes") {
        onOpenNotes();
      } else if (action === "undo") {
        onUndoComplete();
      }
    },
    [controls, onOpenNotes, onUndoComplete]
  );

  // Close revealed actions when tapping the card
  const handleCardTap = useCallback(async () => {
    if (isRevealed) {
      setIsRevealed(false);
      await controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    }
  }, [isRevealed, controls]);

  if (noMotion) {
    // Fallback: no swipe, just render children normally
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Right-swipe background (green complete) */}
      <motion.div
        className="absolute inset-0 flex items-center pl-6 rounded-lg bg-green-500"
        style={{ opacity: rightBgOpacity }}
        aria-hidden="true"
      >
        <motion.div
          style={{ scale: rightCheckScale, opacity: rightCheckOpacity }}
          className="flex items-center gap-2 text-white font-medium"
        >
          <Check className="size-6" strokeWidth={3} />
          <span className="text-sm">Complete</span>
        </motion.div>
      </motion.div>

      {/* Green sweep overlay on completion */}
      {showCompleteSweep && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-green-500/90 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Check className="size-8 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}

      {/* Left-swipe background (action buttons) */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3 rounded-r-lg"
        style={{ opacity: leftBgOpacity }}
        aria-hidden={!isRevealed}
      >
        <motion.div
          className="flex items-center gap-2"
          style={{ x: actionButtonsX }}
        >
          <motion.button
            type="button"
            onClick={() => handleActionClick("notes")}
            className="flex size-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 active:scale-95 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Add note"
          >
            <FileText className="size-4" />
          </motion.button>
          {isCompleted && (
            <motion.button
              type="button"
              onClick={() => handleActionClick("undo")}
              className="flex size-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600 active:scale-95 transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Undo completion"
            >
              <RotateCcw className="size-4" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Draggable card content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: MAX_DRAG_LEFT, right: isCompleted ? 0 : MAX_DRAG_RIGHT }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTap={handleCardTap}
        animate={controls}
        style={{
          x,
          borderColor,
          touchAction: "pan-y",
        }}
        className={cn(
          "relative z-[1] rounded-lg border-2 border-transparent cursor-grab active:cursor-grabbing",
          isDragging && "z-10"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
