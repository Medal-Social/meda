import type { PanelMode, PanelView } from './types.js';
export interface RightPanelProps {
    /** Views to render as tabs in the panel header. */
    panelViews?: PanelView[];
    /** Default active view id — set on mount when no activeView is set in context. */
    defaultView?: string;
    /**
     * Which open-modes this consumer allows.
     * Default is all three: ['panel', 'expanded', 'fullscreen'].
     * If only ['panel'], the cycle button is hidden.
     */
    modes?: PanelMode[];
    className?: string;
}
export declare function RightPanel({ panelViews, defaultView, modes, className, }: RightPanelProps): import("react/jsx-runtime").JSX.Element | null;
