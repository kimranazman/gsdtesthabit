"use client";

import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcut {
  key: string;
  /** Optional modifier keys */
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Description for help dialog */
  description: string;
  /** Handler function */
  handler: () => void;
}

/**
 * Sequence-based shortcut (e.g., "g d" = go to dashboard)
 */
interface SequenceShortcut {
  keys: string[];
  description: string;
  handler: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts?: KeyboardShortcut[];
  sequences?: SequenceShortcut[];
  /** If true, shortcuts are disabled */
  disabled?: boolean;
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  shortcuts = [],
  sequences = [],
  disabled = false,
}: UseKeyboardShortcutsOptions) {
  const sequenceBufferRef = useRef<string[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Don't trigger in input fields
      if (isInputElement(event.target)) return;

      // Don't trigger if a dialog/modal is open (check for [data-state="open"] on dialogs)
      const openDialog = document.querySelector('[role="dialog"]');
      if (openDialog && event.key !== "Escape") return;

      const key = event.key.toLowerCase();

      // Handle single-key shortcuts
      for (const shortcut of shortcuts) {
        const matchKey = shortcut.key.toLowerCase() === key;
        const matchCtrl = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const matchShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          event.preventDefault();
          shortcut.handler();
          // Clear sequence buffer on single-key match
          sequenceBufferRef.current = [];
          return;
        }
      }

      // Handle sequence shortcuts (e.g., "g" then "d")
      if (sequences.length > 0 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Add key to buffer
        sequenceBufferRef.current.push(key);

        // Clear previous timer
        if (sequenceTimerRef.current) {
          clearTimeout(sequenceTimerRef.current);
        }

        // Check for matches
        const buffer = sequenceBufferRef.current;
        for (const seq of sequences) {
          if (
            seq.keys.length === buffer.length &&
            seq.keys.every((k, i) => k.toLowerCase() === buffer[i])
          ) {
            event.preventDefault();
            seq.handler();
            sequenceBufferRef.current = [];
            return;
          }
        }

        // Check if any sequence could still match (partial match)
        const hasPartialMatch = sequences.some(
          (seq) =>
            seq.keys.length > buffer.length &&
            seq.keys.slice(0, buffer.length).every((k, i) => k.toLowerCase() === buffer[i])
        );

        if (hasPartialMatch) {
          // Wait for next key
          sequenceTimerRef.current = setTimeout(() => {
            sequenceBufferRef.current = [];
          }, 800);
        } else {
          // No match possible, clear buffer
          sequenceBufferRef.current = [];
        }
      }
    },
    [shortcuts, sequences, disabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }
    };
  }, [handleKeyDown]);
}
