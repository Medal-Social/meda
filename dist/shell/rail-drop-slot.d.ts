import { type ReactNode, type Ref } from 'react';
/**
 * Describes the slot's current relation to an active drag operation.
 *
 * - `'idle'`     — no drag in progress.
 * - `'active'`   — a drag is in progress and this slot would accept it, but
 *                  the cursor is not currently over this slot.
 * - `'over'`     — the dragged item is hovering over this slot and it would
 *                  accept the drop.
 * - `'rejected'` — the dragged item is hovering over this slot but the slot
 *                  cannot accept it (disabled or `accepts` returns false), OR
 *                  the slot is `disabled` while any drag is active.
 */
export type RailDropSlotState = 'idle' | 'active' | 'over' | 'rejected';
export interface RailDropSlotProps {
    /** Stable id used by dnd-kit; also rendered as `data-slot-id`. */
    id: string;
    /** Decide whether this slot accepts the dragged card. */
    accepts?: (activeId: string) => boolean;
    /** Whether this slot can currently receive a drop (e.g. capacity, online). */
    disabled?: boolean;
    /**
     * Static content. Mutually exclusive with `render`.
     * Use `render` when you need state-aware content.
     */
    children?: ReactNode;
    /**
     * State-aware content factory. Receives the slot's current `RailDropSlotState`
     * so you can render different UI for idle / active / over / rejected states.
     * Mutually exclusive with `children`.
     */
    render?: (state: RailDropSlotState) => ReactNode;
    className?: string;
    /** Visible label for assistive tech. */
    ariaLabel?: string;
    ref?: Ref<HTMLElement>;
}
export declare function RailDropSlot({ id, accepts, disabled, children, render, className, ariaLabel, ref, }: RailDropSlotProps): import("react/jsx-runtime").JSX.Element;
export declare namespace RailDropSlot {
    var displayName: string;
}
