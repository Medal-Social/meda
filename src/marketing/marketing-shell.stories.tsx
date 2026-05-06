import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingShell } from './marketing-shell.js';

const meta = {
  title: 'Marketing/Shell',
  component: MarketingShell,
  parameters: {
    layout: 'fullscreen',
    chromatic: { modes: { desktop: { viewport: 1280 }, mobile: { viewport: 390 } } },
  },
  args: {
    header: <div className="rounded-full border border-border bg-card px-6 py-3">Header</div>,
    children: <div className="p-12">Main content</div>,
    footer: <div className="border-t border-border p-6 text-muted-foreground">Footer</div>,
  },
} satisfies Meta<typeof MarketingShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
