export interface DateSwitcherProps {
    /** Currently selected date. */
    value: Date;
    /** Reference for "today" comparison and forward-disable. */
    now: Date;
    onChange: (next: Date) => void;
    className?: string;
}
export declare function DateSwitcher({ value, now, onChange, className }: DateSwitcherProps): import("react/jsx-runtime").JSX.Element;
