import type { ShellContentLayout, ShellViewportBand } from './extras/types.js';

const DESKTOP_APP_RAIL_WIDTH = 80;
const DESKTOP_SECTION_SIDEBAR_TOGGLE_WIDTH = 20;
const DESKTOP_SECTION_SIDEBAR_RESIZE_WIDTH = 2;
const DESKTOP_PANEL_HANDLE_WIDTH = 8;
const DESKTOP_PANEL_GUTTER = 16;
const SIDE_PANEL_MIN_WIDTH = 280;
const SIDE_PANEL_MAX_WIDTH = 520;

export function getShellContentMaxWidth(
  layout: ShellContentLayout,
  viewportBand: ShellViewportBand
) {
  if (layout === 'workspace') {
    if (viewportBand === 'desktop') return 1120;
    if (viewportBand === 'wide') return 1280;
    if (viewportBand === 'ultrawide') return 1400;
    return undefined;
  }

  if (layout === 'fullbleed') {
    if (viewportBand === 'desktop') return 1440;
    if (viewportBand === 'wide') return 1760;
    if (viewportBand === 'ultrawide') return 1920;
    return undefined;
  }

  return undefined;
}

export function getResolvedShellPanelWidth({
  preferredWidth,
  viewportWidth,
  sidebarOpen,
  sidebarWidth,
}: {
  preferredWidth: number;
  viewportWidth: number;
  sidebarOpen: boolean;
  sidebarWidth: number;
}) {
  const leftNavigationWidth =
    DESKTOP_APP_RAIL_WIDTH +
    DESKTOP_SECTION_SIDEBAR_TOGGLE_WIDTH +
    (sidebarOpen ? sidebarWidth + DESKTOP_SECTION_SIDEBAR_RESIZE_WIDTH : 0);
  const clampedPreferredWidth = Math.min(
    SIDE_PANEL_MAX_WIDTH,
    Math.max(SIDE_PANEL_MIN_WIDTH, preferredWidth)
  );
  const maxWidthForViewport =
    viewportWidth - leftNavigationWidth - DESKTOP_PANEL_GUTTER * 2 - DESKTOP_PANEL_HANDLE_WIDTH;

  if (!Number.isFinite(maxWidthForViewport)) return clampedPreferredWidth;

  return Math.max(
    SIDE_PANEL_MIN_WIDTH,
    Math.min(clampedPreferredWidth, Math.floor(maxWidthForViewport))
  );
}
