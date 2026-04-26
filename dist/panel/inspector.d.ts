import type { InspectorTab } from './types.js';
export interface InspectorProps {
    tabs: InspectorTab[];
    defaultTab?: string;
    className?: string;
}
export declare function Inspector({ tabs, defaultTab, className }: InspectorProps): import("react/jsx-runtime").JSX.Element;
