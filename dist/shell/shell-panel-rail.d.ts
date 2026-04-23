import type { ShellPanelDefinition } from './types.js';
export interface ShellPanelRailProps {
    moduleViews: ShellPanelDefinition[];
    globalViews: ShellPanelDefinition[];
    activePanelView: string | null;
    className?: string;
    onTogglePanelView: (viewId: string) => void;
}
export declare function ShellPanelRail({ moduleViews, globalViews, activePanelView, className, onTogglePanelView, }: ShellPanelRailProps): import("react/jsx-runtime").JSX.Element | null;
