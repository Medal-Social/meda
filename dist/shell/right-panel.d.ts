import type { ButtonHTMLAttributes, ReactNode } from 'react';
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
    renderTab?: (args: RightPanelTabRenderArgs) => ReactNode;
    className?: string;
}
export interface RightPanelTabRenderArgs {
    view: PanelView;
    isActive: boolean;
    buttonProps: RightPanelTabButtonProps;
    children: ReactNode;
}
export type RightPanelTabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    'data-active'?: boolean;
};
export declare function RightPanel({ panelViews, defaultView, modes, renderTab, className, }: RightPanelProps): import("react/jsx-runtime").JSX.Element | null;
