import type { ShellContentLayout, ShellViewportBand } from './types.js';
export declare function getShellContentMaxWidth(layout: ShellContentLayout, viewportBand: ShellViewportBand): 1120 | 1280 | 1400 | 1440 | 1760 | 1920 | undefined;
export declare function getResolvedShellPanelWidth({ preferredWidth, viewportWidth, sidebarOpen, sidebarWidth, }: {
    preferredWidth: number;
    viewportWidth: number;
    sidebarOpen: boolean;
    sidebarWidth: number;
}): number;
