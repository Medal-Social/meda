export interface LiveIndicatorProps {
    now: Date;
    /** Optional IANA timezone for the displayed clock. */
    tz?: string;
    className?: string;
}
export declare function LiveIndicator({ now, tz, className }: LiveIndicatorProps): import("react/jsx-runtime").JSX.Element;
