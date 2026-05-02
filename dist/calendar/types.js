// Public types for the @medalsocial/meda/calendar surface.
export const DEFAULT_CALENDAR_LABELS = {
    today: 'Today',
    previous: 'Previous',
    next: 'Next',
    monthView: 'Month',
    weekView: 'Week',
    dayView: 'Day',
    noEvents: 'No events',
    moreCount: (count) => `+${count} more`,
    eventCountLabel: (count) => `${count} ${count === 1 ? 'event' : 'events'}`,
    addEvent: 'Add event',
    viewDay: 'View day',
    close: 'Close',
};
