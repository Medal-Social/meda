import { describe, expect, it } from 'vitest';
import { createVolumeSmoother } from './voice-orb-volume.js';

describe('createVolumeSmoother', () => {
  it('starts at zero', () => {
    const s = createVolumeSmoother();
    expect(s.value).toBe(0);
  });

  it('attacks fast on rising signal', () => {
    const s = createVolumeSmoother();
    s.update(0);
    s.update(1);
    // With default attackAlpha=0.85, one step from 0 gives 0.85
    expect(s.value).toBeGreaterThan(0.5);
  });

  it('decays slowly on falling signal', () => {
    const s = createVolumeSmoother();
    // Drive to near 1
    s.update(1);
    s.update(1);
    // Now drop to 0 — should not reach 0 immediately
    s.update(0);
    expect(s.value).toBeGreaterThan(0);
  });

  it('clamps inputs outside 0..1', () => {
    const s = createVolumeSmoother();
    s.update(2);
    expect(s.value).toBeLessThanOrEqual(1);
    const s2 = createVolumeSmoother();
    s2.update(-1);
    expect(s2.value).toBeGreaterThanOrEqual(0);
  });

  it('converges to target over multiple updates', () => {
    const s = createVolumeSmoother(1.0, 1.0); // instant convergence
    s.update(0.7);
    expect(s.value).toBeCloseTo(0.7, 5);
  });
});
