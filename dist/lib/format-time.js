export function formatClock(date, opts = {}) {
    const { tz, withSeconds = true } = opts;
    const fmt = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: withSeconds ? '2-digit' : undefined,
        hour12: false,
        timeZone: tz,
    });
    return fmt.format(date);
}
export function formatDuration(ms) {
    if (ms < 0)
        ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0)
        return `${h}h ${m}m`;
    if (m > 0)
        return `${m}m ${s}s`;
    return `${s}s`;
}
export function formatRelativeOffset(ms) {
    const sign = ms < 0 ? '-' : '+';
    const abs = Math.abs(ms);
    const totalSec = Math.floor(abs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0)
        return `${sign}${s}s`;
    return `${sign}${m}m ${s}s`;
}
