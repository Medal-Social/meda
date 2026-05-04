import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Calendar } from '../calendar.js';
import type { CalendarView } from '../types.js';
import { REFERENCE_MONTH, SAMPLE_EVENTS } from './fixtures.js';

const meta: Meta<typeof Calendar> = {
  title: 'Data Views/Calendar/Calendar',
  component: Calendar,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const MonthDefault: Story = {
  render: () => {
    const [date, setDate] = useState(REFERENCE_MONTH);
    const [view, setView] = useState<CalendarView>('month');
    return (
      <div className="p-6">
        <Calendar
          date={date}
          view={view}
          events={SAMPLE_EVENTS}
          onDateChange={setDate}
          onViewChange={setView}
        />
      </div>
    );
  },
};

export const WeekStartsMonday: Story = {
  render: () => {
    const [date, setDate] = useState(REFERENCE_MONTH);
    const [view, setView] = useState<CalendarView>('week');
    return (
      <div className="p-6">
        <Calendar
          date={date}
          view={view}
          events={SAMPLE_EVENTS}
          onDateChange={setDate}
          onViewChange={setView}
          weekStartsOn={1}
        />
      </div>
    );
  },
};

export const DayView: Story = {
  render: () => {
    const [date, setDate] = useState(REFERENCE_MONTH);
    return (
      <div className="p-6">
        <Calendar
          date={date}
          view="day"
          events={SAMPLE_EVENTS}
          onDateChange={setDate}
          onEventClick={(e) => {
            // Inert in story; real apps wire this to a detail drawer.
            console.log('event clicked', e.id);
          }}
        />
      </div>
    );
  },
};
