"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with a subtle fade + slide-up transition.
 * Respects prefers-reduced-motion by skipping transforms.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : {
              type: "tween",
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
