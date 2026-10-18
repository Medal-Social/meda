import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ShellContentLayout, ShellViewportBand } from '../../../src/shell/extras/types.js';
import {
  getResolvedShellPanelWidth,
  getShellContentMaxWidth,
} from '../../../src/shell/shell-layout-utils.js';

/**
 * `getResolvedShellPanelWidth` decides how wide the right panel is allowed to
 * be given the viewport and whatever the section sidebar is doing. Every
 * workspace route runs it on every resize, and the numbers it juggles — a rail,
 * a toggle, a resize strip, a handle, two gutters — are exactly the kind of
 * arithmetic where an example test happens to pick the arguments that work.
 *
 * These are the guarantees the shell actually depends on, not a restatement of
 * the implementation. Each one would have caught a real class of bug: a panel
 * narrower than its minimum clips its own content, a panel wider than its
 * maximum overlaps the main region, and a non-monotonic response to a drag
 * makes the resize handle feel like it is fighting the pointer.
 */

const SIDE_PANEL_MIN_WIDTH = 280;
const SIDE_PANEL_MAX_WIDTH = 520;

/** Realistic, finite inputs — the contract is undefined for NaN/Infinity. */
const args = fc.record({
  preferredWidth: fc.integer({ min: -2000, max: 4000 }),
  viewportWidth: fc.integer({ min: 0, max: 8000 }),
  sidebarOpen: fc.boolean(),
  sidebarWidth: fc.integer({ min: 0, max: 800 }),
});

describe('getResolvedShellPanelWidth (property)', () => {
  it('always lands inside the panel bounds', () => {
    fc.assert(
      fc.property(args, (a) => {
        const width = getResolvedShellPanelWidth(a);
        expect(width).toBeGreaterThanOrEqual(SIDE_PANEL_MIN_WIDTH);
        expect(width).toBeLessThanOrEqual(SIDE_PANEL_MAX_WIDTH);
      })
    );
  });

  it('never shrinks when the user drags the handle wider', () => {
    // The resize handle feeds `preferredWidth` straight through. If a larger
    // preference could ever produce a narrower panel, dragging right would
    // sometimes move the edge left.
    fc.assert(
      fc.property(args, fc.integer({ min: 0, max: 3000 }), (a, delta) => {
        const narrower = getResolvedShellPanelWidth(a);
        const wider = getResolvedShellPanelWidth({
          ...a,
          preferredWidth: a.preferredWidth + delta,
        });
        expect(wider).toBeGreaterThanOrEqual(narrower);
      })
    );
  });

  it('never shrinks when the window gets wider', () => {
    fc.assert(
      fc.property(args, fc.integer({ min: 0, max: 4000 }), (a, delta) => {
        const small = getResolvedShellPanelWidth(a);
        const large = getResolvedShellPanelWidth({
          ...a,
          viewportWidth: a.viewportWidth + delta,
        });
        expect(large).toBeGreaterThanOrEqual(small);
      })
    );
  });

  it('never grows when the sidebar opens and takes space away', () => {
    fc.assert(
      fc.property(args, (a) => {
        const closed = getResolvedShellPanelWidth({ ...a, sidebarOpen: false });
        const open = getResolvedShellPanelWidth({ ...a, sidebarOpen: true });
        expect(open).toBeLessThanOrEqual(closed);
      })
    );
  });

  it('is a fixed point: feeding the resolved width back changes nothing', () => {
    // The shell persists the resolved width and replays it as the preference
    // on the next mount. If that were not stable the panel would creep across
    // reloads.
    fc.assert(
      fc.property(args, (a) => {
        const once = getResolvedShellPanelWidth(a);
        const twice = getResolvedShellPanelWidth({ ...a, preferredWidth: once });
        expect(twice).toBe(once);
      })
    );
  });
});

const LAYOUTS: ShellContentLayout[] = ['workspace', 'fullbleed', 'centered'];
const BANDS: ShellViewportBand[] = ['mobile', 'tablet', 'desktop', 'wide', 'ultrawide'];

describe('getShellContentMaxWidth (property)', () => {
  it('returns either undefined or a sane positive pixel count', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LAYOUTS), fc.constantFrom(...BANDS), (layout, band) => {
        const max = getShellContentMaxWidth(layout, band);
        if (max === undefined) return;
        expect(Number.isInteger(max)).toBe(true);
        expect(max).toBeGreaterThan(0);
        expect(max).toBeLessThanOrEqual(4000);
      })
    );
  });

  it('never narrows the content as the viewport band widens', () => {
    // desktop -> wide -> ultrawide must be non-decreasing, or a user widening
    // their window would see the content column jump inwards.
    const ordered: ShellViewportBand[] = ['desktop', 'wide', 'ultrawide'];
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUTS),
        fc.integer({ min: 0, max: ordered.length - 2 }),
        (layout, i) => {
          const narrower = getShellContentMaxWidth(layout, ordered[i]);
          const wider = getShellContentMaxWidth(layout, ordered[i + 1]);
          if (narrower === undefined || wider === undefined) return;
          expect(wider).toBeGreaterThanOrEqual(narrower);
        }
      )
    );
  });
});
