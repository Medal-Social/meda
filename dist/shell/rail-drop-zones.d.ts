import { type ReactNode } from 'react';
export interface RailDropZonesProps {
    /** Section title — uppercased in the header. Defaults to "Drop zones". */
    title?: string;
    /** Subtitle shown under the title (e.g. "Eligible machines for ENG-405 · claude"). */
    subtitle?: ReactNode;
    /** Count badge rendered in the header corner, e.g. "3 / 4". */
    count?: ReactNode;
    /** Optional icon rendered at the start of the header. */
    icon?: ReactNode;
    /**
     * When set, overrides the auto-detected drag-active state. Useful for
     * Storybook stories that want to demonstrate the active visual without a
     * real drag in progress.
     */
    forceActive?: boolean;
    /**
     * Optional predicate; when supplied only activates the rail outline for
     * matching drag ids. Receives `active.id` of the current drag.
     */
    isActive?: (activeId: string | number) => boolean;
    children: ReactNode;
    className?: string;
}
export declare function RailDropZones({ title, subtitle, count, icon, forceActive, isActive, children, className, }: RailDropZonesProps): import("react/jsx-runtime").JSX.Element;
export declare namespace RailDropZones {
    var displayName: string;
}
