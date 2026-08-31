import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion language. Framer can't read CSS variables, so this module is
 * the JS half of the token system in globals.css — EASE mirrors --ease-lumora.
 * Keep the two in sync.
 *
 * Both surfaces use the same variants and the same easing curve; only the
 * *cadence* differs. Marketing is slow and theatrical; product runs the same
 * gesture at roughly 2x speed so data never feels withheld.
 *
 * Variants are exported as ready-made constants rather than factories so a
 * re-render can't hand a motion component a new object and restart its
 * animation mid-flight.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Landing / waitlist cadence. */
export const MARKETING = { duration: 0.6, stagger: 0.2 } as const;

/** Dashboard cadence. */
export const PRODUCT = { duration: 0.4, stagger: 0.06 } as const;

/** One-off tween on the brand curve, for cases the variants below don't cover. */
export const ease = (duration: number, delay = 0): Transition => ({
  duration,
  ease: EASE,
  delay,
});

/** Physical response for hover / press / shared-layout, where a tween feels dead. */
export const springy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

/* ── Entrances ─────────────────────────────────────────────────────────────
   Each variant carries its own transition so the `transition` prop on a
   motion component stays free for hover/press states. */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: PRODUCT.duration, ease: EASE },
  },
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MARKETING.duration, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: PRODUCT.duration, ease: EASE } },
};

export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: MARKETING.duration, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: PRODUCT.duration, ease: EASE },
  },
};

/* ── Containers ────────────────────────────────────────────────────────────
   Children that declare `variants` and no `initial`/`animate` of their own
   inherit hidden -> show through context, so intermediate plain elements
   (grids, wrappers) don't break the stagger. */

export const staggerProduct: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: PRODUCT.stagger } },
};

export const staggerMarketing: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: MARKETING.stagger } },
};

/** Custom-gap container, for the rare case the two above don't fit. */
export const stagger = (gap: number, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
});

/** Card lift. Spread onto a motion element: `{...cardHover}`. */
export const cardHover = {
  whileHover: { y: -4 },
  whileTap: { scale: 0.995 },
  transition: springy,
};
