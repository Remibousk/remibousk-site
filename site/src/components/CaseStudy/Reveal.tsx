'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Appear wrapper matching the original's Framer appear effect (measured from
 * __framer__appearAnimationsContent in the mirror HTML: opacity 0.001 -> 1,
 * y 120 -> 0, spring bounce 0.2, duration 0.4s). The original only animates
 * the titled cards on /onboardingtoctc and /mobileweb — apply this component
 * exactly there.
 *
 * These fire ON PAGE LOAD, not on scroll. The original's inline appear script
 * (`data-framer-appear-animation` in the mirror HTML) calls
 * `animator.animateAppearEffects(...)` inside a single `requestAnimationFrame`
 * and starts *every* registered element at once — its `Ee()` implementation
 * just iterates the effect map and calls the start callback, with no
 * IntersectionObserver and no scroll trigger anywhere in the path. Cards below
 * the fold have therefore finished animating long before you scroll to them.
 * (This component previously used `whileInView`, which made them pop in on
 * scroll — a behaviour the original does not have.)
 *
 * Respects prefers-reduced-motion by rendering a plain div — the original's
 * appear script takes the same out, receiving `false` for its
 * `prefers-reduced-motion` argument only when the media query does not match.
 */
export default function Reveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.001, y: 120 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
