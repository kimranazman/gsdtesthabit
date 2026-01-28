"use client";

import { type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

interface AnimatePresenceWrapperProps {
  children: ReactNode;
}

/**
 * Client-side AnimatePresence wrapper for the root layout.
 * Enables exit animations on route transitions and child unmounts.
 *
 * mode="wait" ensures the exiting page finishes before the entering page starts.
 * For a smoother feel, we use "sync" mode which allows overlap.
 */
export function AnimatePresenceWrapper({
  children,
}: AnimatePresenceWrapperProps) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
