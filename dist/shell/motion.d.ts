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
export declare const motion: {
    readonly fast: 140;
    readonly default: 200;
    readonly panel: 240;
    readonly fullscreen: 280;
    readonly ease: "cubic-bezier(0.2, 0.8, 0.2, 1)";
    readonly spring: {
        readonly stiffness: 420;
        readonly damping: 34;
    };
};
