import type { Meta, StoryObj } from '@storybook/react-vite';
import { TwitterPreview } from '../platforms/index.js';
import { BASE_FIXTURE } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / Responsive',
  // Twitter dim/lights-out swatches use authentic colors that fail color-contrast.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
};
export default meta;
type Story = StoryObj;

const widths = [280, 360, 420, 640, 800] as const;

export const ContainerWidths: Story = {
  render: () => (
    <div className="space-y-6">
      {widths.map((w) => (
        <section key={w}>
          <h3 className="mb-2 font-semibold text-sm">{w}px container</h3>
          <div style={{ width: w }} className="border border-dashed">
            <TwitterPreview {...BASE_FIXTURE} />
          </div>
        </section>
      ))}
    </div>
  ),
};
