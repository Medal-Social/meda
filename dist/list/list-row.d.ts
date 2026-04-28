/**
 * List Row Component
 *
 * Base row wrapper for Linear-style table rows.
 * Provides consistent styling for hover, selection, and keyboard focus states.
 */
import type { ReactNode } from 'react';
export interface ListRowProps {
    /** Whether this row is selected */
    selected?: boolean;
    /** Whether any item in the list is selected (keeps checkbox always visible) */
    selectionActive?: boolean;
    /** Callback when selection changes (shiftKey for range selection) */
    onSelect?: (selected: boolean, shiftKey?: boolean) => void;
    /** Click handler for row navigation */
    onClick?: () => void;
    /** Mouse enter handler for prefetching */
    onMouseEnter?: () => void;
    /** Mouse leave handler */
    onMouseLeave?: () => void;
    /** Focus handler for keyboard intent prefetching */
    onFocus?: () => void;
    /** Blur handler */
    onBlur?: () => void;
    /** Whether this row has keyboard focus */
    focused?: boolean;
    /** Children to render inside the row */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}
/**
 * A Linear-style list row with checkbox, hover states, and click handling.
 * Compact ~40-48px height for dense, scannable lists.
 */
export declare function ListRow({ selected, selectionActive, onSelect, onClick, onMouseEnter, onMouseLeave, onFocus, onBlur, focused, children, className, }: ListRowProps): import("react/jsx-runtime").JSX.Element;
/**
 * Cell wrapper for consistent column sizing
 */
export interface ListCellProps {
    /** Width class (e.g., 'w-8', 'w-24', 'flex-1') */
    width?: string;
    /** Whether to shrink if needed */
    shrink?: boolean;
    /** Alignment */
    align?: 'left' | 'center' | 'right';
    /** Children */
    children?: ReactNode;
    /** Additional class names */
    className?: string;
}
export declare function ListCell({ width, shrink, align, children, className, }: ListCellProps): import("react/jsx-runtime").JSX.Element;
