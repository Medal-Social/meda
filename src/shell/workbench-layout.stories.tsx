import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkbenchLayout } from './workbench-layout.js';

const meta = {
  title: 'Shell/WorkbenchLayout',
  component: WorkbenchLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkbenchLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const main = <div style={{ height: 320, background: 'var(--card, #222)', padding: 16 }}>Main</div>;
const aside = (
  <div style={{ height: 320, background: 'var(--card, #222)', padding: 16 }}>Aside</div>
);
const toolbar = (
  <div style={{ height: 40, background: 'var(--muted, #1a1a1a)', padding: 8 }}>Toolbar</div>
);

export const Mobile: Story = { args: { viewportBand: 'mobile', main, aside, toolbar } };
export const Desktop: Story = { args: { viewportBand: 'desktop', main, aside, toolbar } };
export const Wide: Story = { args: { viewportBand: 'wide', main, aside, toolbar } };
export const SingleColumn: Story = { args: { viewportBand: 'desktop', main, toolbar } };
