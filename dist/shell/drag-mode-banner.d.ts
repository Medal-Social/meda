import { type ReactNode } from 'react';
/**
 * Props for DragModeBanner.
 *
 * **Important:** This component uses `useDndMonitor` internally and must be
 * rendered inside the same `<DndContext>` tree it is monitoring.
 *
 * **Known limitation:** The ESC chip is decorative only. Keyboard-initiated
 * drags cancel naturally via dnd-kit's KeyboardSensor; pointer-initiated drags
 * require the user to release outside any drop zone — a manual ESC handler for
 * pointer drags is not yet implemented.
 */
export interface DragModeBannerProps {
    /** Banner message shown while a drag is active. */
    message: ReactNode;
    /**
     * When provided, render an ESC chip indicating the user can press Escape to
     * cancel. See known limitation note above.
     */
    cancelKey?: 'ESC';
    /**
     * Optional predicate; when supplied only activates the banner for matching
     * drag ids. Receives the `active.id` of the current drag.
     */
    isActive?: (activeId: string | number) => boolean;
    className?: string;
}
export declare function DragModeBanner({ message, cancelKey, isActive, className }: DragModeBannerProps): import("react/jsx-runtime").JSX.Element | null;
export declare namespace DragModeBanner {
    var displayName: string;
}
