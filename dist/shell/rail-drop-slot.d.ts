import type { ReactNode, Ref } from 'react';
export interface RailDropSlotProps {
    /** Stable id used by dnd-kit; also rendered as `data-slot-id`. */
    id: string;
    /** Decide whether this slot accepts the dragged card. */
    accepts?: (activeId: string) => boolean;
    /** Whether this slot can currently receive a drop (e.g. capacity, online). */
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    /** Visible label for assistive tech. */
    ariaLabel?: string;
    ref?: Ref<HTMLElement>;
}
export declare function RailDropSlot({ id, accepts, disabled, children, className, ariaLabel, ref, }: RailDropSlotProps): import("react/jsx-runtime").JSX.Element;
export declare namespace RailDropSlot {
    var displayName: string;
}
