"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Hook that returns true when the user prefers reduced motion.
 * Wraps framer-motion's useReducedMotion for consistent usage across the app.
 *
 * When reduced motion is preferred, animations should be disabled or replaced
 * with simple opacity transitions.
 */
export function useReducedMotion(): boolean {
  const prefersReduced = useFramerReducedMotion();
  return !!prefersReduced;
}

/**
 * Returns animation variants that respect reduced motion preferences.
 * When reduced motion is on, animations use instant transitions (duration: 0).
 */
export function getReducedMotionProps(prefersReduced: boolean) {
  if (prefersReduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }
  return {};
}
