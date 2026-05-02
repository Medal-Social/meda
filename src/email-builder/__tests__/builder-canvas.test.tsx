import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBlock } from '../block-registry.js';
import { BuilderCanvas } from '../builder-canvas.js';
import { BuilderDndWrapper } from '../internal/dnd-wrapper.js';
import { defaultEmailBuilderLabels } from '../types.js';

describe('BuilderCanvas', () => {
  it('shows the empty state when there are no blocks', () => {
    render(
      <BuilderDndWrapper blockIds={[]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={defaultEmailBuilderLabels}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByText(defaultEmailBuilderLabels.emptyTitle)).toBeInTheDocument();
  });

  it('renders blocks in order', () => {
    const a = createBlock('heading', { text: 'First' });
    const b = createBlock('heading', { text: 'Second' });
    render(
      <BuilderDndWrapper blockIds={[a.id, b.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[a, b]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={defaultEmailBuilderLabels}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
