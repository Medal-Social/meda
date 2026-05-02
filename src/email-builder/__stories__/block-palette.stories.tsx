import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BlockPalette } from '../block-palette.js';
import type { BlockKind } from '../types.js';

const meta: Meta<typeof BlockPalette> = {
  title: 'Email Builder/BlockPalette',
  component: BlockPalette,
};

export default meta;

type Story = StoryObj<typeof BlockPalette>;

function PaletteHarness() {
  const [picked, setPicked] = useState<BlockKind | null>(null);
  return (
    <div style={{ width: 280 }}>
      <BlockPalette onPick={setPicked} />
      <div style={{ marginTop: 12, fontSize: 12 }}>Picked: {picked ?? '—'}</div>
    </div>
  );
}

export const Default: Story = { render: () => <PaletteHarness /> };
