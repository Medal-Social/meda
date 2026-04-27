import type { ShellContentLayout, ShellViewportBand } from './extras/types.js';
export declare function getShellContentMaxWidth(layout: ShellContentLayout, viewportBand: ShellViewportBand): 1440 | 1760 | 1920 | 1120 | 1280 | 1400 | undefined;
export declare function getResolvedShellPanelWidth({ preferredWidth, viewportWidth, sidebarOpen, sidebarWidth, }: {
    preferredWidth: number;
    viewportWidth: number;
    sidebarOpen: boolean;
    sidebarWidth: number;
}): number;
