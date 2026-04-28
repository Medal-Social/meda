import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Lane, LaneBar, LaneLegendItem } from './index.js';
import { LaneTimeline } from './index.js';

const NOW = new Date();
function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60_000);
}

const LANES: Lane[] = [
  {
    id: 'mac-mini-01',
    label: 'mac-mini-01',
    sublabel: '3 sessions',
    statusDotClass: 'bg-success-500',
    bars: [
      {
        id: 'b1',
        label: 'Boss route fix',
        start: ago(330),
        end: ago(260),
        fillClass: 'bg-success-500/70',
      },
      {
        id: 'b2',
        label: 'Auth migration',
        start: ago(240),
        end: ago(160),
        fillClass: 'bg-success-500/70',
      },
      { id: 'b3', label: 'WS subs · 4m', start: ago(40), end: ago(36), fillClass: 'bg-primary/80' },
    ],
  },
  {
    id: 'studio-mbp',
    label: 'studio-mbp',
    sublabel: '2 sessions',
    statusDotClass: 'bg-success-500',
    bars: [
      {
        id: 'b4',
        label: 'DataTable migration · needs review',
        start: ago(300),
        end: ago(120),
        fillClass: 'bg-warning-500/70',
      },
      { id: 'b5', label: 'VR test', start: ago(70), end: ago(35), fillClass: 'bg-primary/80' },
    ],
  },
  {
    id: 'home-server',
    label: 'home-server',
    sublabel: 'idle',
    statusDotClass: 'bg-warning-500',
    bars: [
      {
        id: 'b6',
        label: 'Fixtures',
        start: ago(280),
        end: ago(230),
        fillClass: 'bg-success-500/70',
      },
      { id: 'b7', label: 'Docs', start: ago(180), end: ago(140), fillClass: 'bg-success-500/70' },
      { id: 'b8', label: 'Failed', start: ago(80), end: ago(60), fillClass: 'bg-destructive/70' },
    ],
  },
  {
    id: 'work-laptop',
    label: 'work-laptop',
    sublabel: 'offline',
    statusDotClass: 'bg-muted-foreground',
    muted: true,
    bars: [],
  },
];

const LEGEND: LaneLegendItem[] = [
  { label: 'running', swatchClass: 'bg-primary/80' },
  { label: 'success', swatchClass: 'bg-success-500/70' },
  { label: 'needs review', swatchClass: 'bg-warning-500/70' },
  { label: 'failed', swatchClass: 'bg-destructive/70' },
];

const meta: Meta<typeof LaneTimeline> = {
  title: 'Timeline/LaneTimeline',
  component: LaneTimeline,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      // Bar fill colors use Tailwind opacity tokens (e.g. bg-primary/80) that
      // resolve differently in jsdom vs a real browser. The authoritative a11y
      // audit runs in wcag.test.tsx where the component is rendered with
      // opaque fixture colors.
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
};
export default meta;

export const FleetTimeline: StoryObj<typeof LaneTimeline> = {
  render: () => {
    const [selected, setSelected] = useState<LaneBar | undefined>();
    return (
      <div className="p-6">
        <LaneTimeline
          title="Timeline"
          groupChip="Group: Machines"
          activeCount={3}
          lanes={LANES}
          legend={LEGEND}
          selectedBarId={selected?.id}
          onSelectBar={(bar) => setSelected(bar)}
        />
        {selected && (
          <div className="mt-3 rounded-md border border-border bg-card p-3 text-sm">
            Selected: <span className="font-medium">{selected.label}</span>
          </div>
        )}
      </div>
    );
  },
};
