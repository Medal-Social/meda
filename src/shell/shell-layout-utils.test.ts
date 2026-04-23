import { describe, expect, it } from 'vitest';
import { getResolvedShellPanelWidth, getShellContentMaxWidth } from './shell-layout-utils';

describe('shell-layout-utils', () => {
  it('returns workspace content caps by viewport band', () => {
    expect(getShellContentMaxWidth('workspace', 'desktop')).toBe(1120);
    expect(getShellContentMaxWidth('workspace', 'wide')).toBe(1280);
    expect(getShellContentMaxWidth('workspace', 'ultrawide')).toBe(1400);
  });

  it('returns fullbleed content caps by viewport band', () => {
    expect(getShellContentMaxWidth('fullbleed', 'desktop')).toBe(1440);
    expect(getShellContentMaxWidth('fullbleed', 'wide')).toBe(1760);
    expect(getShellContentMaxWidth('fullbleed', 'ultrawide')).toBe(1920);
  });

  it('returns undefined when the layout should not be capped', () => {
    expect(getShellContentMaxWidth('centered', 'desktop')).toBeUndefined();
    expect(getShellContentMaxWidth('workspace', 'tablet')).toBeUndefined();
  });

  it('clamps panel width against viewport and shell chrome', () => {
    expect(
      getResolvedShellPanelWidth({
        preferredWidth: 420,
        viewportWidth: 1280,
        sidebarOpen: true,
        sidebarWidth: 280,
      })
    ).toBe(420);
  });

  it('falls back to the minimum width when viewport room is too small', () => {
    expect(
      getResolvedShellPanelWidth({
        preferredWidth: 520,
        viewportWidth: 720,
        sidebarOpen: true,
        sidebarWidth: 320,
      })
    ).toBe(280);
  });
});
