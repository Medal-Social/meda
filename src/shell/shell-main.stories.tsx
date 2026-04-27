import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ShellMain } from './shell-main.js';

const meta = {
  title: 'Shell v2/ShellMain',
  component: ShellMain,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  // Provide a base children arg so TypeScript is satisfied; each story overrides via render().
  args: { children: null as unknown as ReactNode },
} satisfies Meta<typeof ShellMain>;

export default meta;
type Story = StoryObj<typeof meta>;

const PlaceholderContent = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground mb-2">Page title</h1>
    <p className="text-muted-foreground mb-6">
      This is a placeholder paragraph to illustrate typography and spacing in the main content area.
      It shows how the layout constrains or expands to fill available space.
    </p>
    <h2 className="text-xl font-medium text-foreground mb-2">Section heading</h2>
    <p className="text-muted-foreground mb-4">
      Medal's workspace layout uses a max-width of 1280px with horizontal padding that responds to
      the viewport. On wider screens the content is comfortably centred inside the shell region.
    </p>
    <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
      A card surface rendered inside the main content column.
    </div>
  </div>
);

/**
 * Workspace (default): max-width 1280px, responsive horizontal padding.
 * This is the layout for most dashboard-style views.
 */
export const Workspace: Story = {
  render: () => (
    <ShellMain layout="workspace">
      <PlaceholderContent />
    </ShellMain>
  ),
};

/**
 * Centered: narrow column, centred horizontally.
 * Use for document editors, settings pages, or prose-heavy views.
 */
export const Centered: Story = {
  render: () => (
    <ShellMain layout="centered">
      <PlaceholderContent />
    </ShellMain>
  ),
};

/**
 * Fullbleed: edge-to-edge, no max-width or horizontal padding.
 * Use for canvas tools, video players, or map views.
 */
export const Fullbleed: Story = {
  render: () => (
    <ShellMain layout="fullbleed">
      <div className="flex h-64 items-center justify-center bg-muted text-muted-foreground text-sm">
        Full-bleed content — fills the entire main region with no padding or max-width constraint.
      </div>
    </ShellMain>
  ),
};
