export interface FormatClockOptions {
    /** IANA timezone, e.g. "Europe/Stockholm". Defaults to local tz. */
    tz?: string;
    /** Include seconds (default true). */
    withSeconds?: boolean;
}
export declare function formatClock(date: Date, opts?: FormatClockOptions): string;
export declare function formatDuration(ms: number): string;
export declare function formatRelativeOffset(ms: number): string;
