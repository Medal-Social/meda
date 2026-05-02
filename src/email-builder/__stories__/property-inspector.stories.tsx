import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createBlock } from '../block-registry.js';
import { PropertyInspector } from '../property-inspector.js';
import type { EmailBlock } from '../types.js';

const meta: Meta<typeof PropertyInspector> = {
  title: 'Email Builder/PropertyInspector',
  component: PropertyInspector,
};

export default meta;

type Story = StoryObj<typeof PropertyInspector>;

function Harness({ initial }: { initial: EmailBlock }) {
  const [block, setBlock] = useState<EmailBlock>(initial);
  return (
    <div style={{ maxWidth: 360 }}>
      <PropertyInspector
        block={block}
        emptyContent="Select a block."
        onChange={(_id, patch) => setBlock((b) => ({ ...b, props: { ...b.props, ...patch } }))}
      />
    </div>
  );
}

export const Heading: Story = { render: () => <Harness initial={createBlock('heading')} /> };
export const Button: Story = { render: () => <Harness initial={createBlock('button')} /> };
export const Footer: Story = { render: () => <Harness initial={createBlock('footer')} /> };
