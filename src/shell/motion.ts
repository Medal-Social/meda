/**
 * Motion tokens (spec §14).
 *
 * Numeric values are unitless milliseconds — consumers append `ms`:
 *   `transition-duration: ${motion.default}ms`
 *
 * Mirrored as CSS custom properties in `src/styles/tokens.css` for use
 * via Tailwind arbitrary values (e.g. `duration-[var(--motion-default)]`).
 *
 * `spring` is JS-only (no CSS analogue); for Framer Motion / react-spring.
 */
export const motion = {
  fast: 140,
  default: 200,
  panel: 240,
  fullscreen: 280,
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  spring: { stiffness: 420, damping: 34 },
} as const;
