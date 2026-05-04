<<<<<<< HEAD:test/unit/email-builder/builder-canvas.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBlock } from '../../../src/email-builder/block-registry.js';
import { BuilderCanvas } from '../../../src/email-builder/builder-canvas.js';
import { BuilderDndWrapper } from '../../../src/email-builder/internal/dnd-wrapper.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';
||||||| parent of 5f920f1 (Expand builder-canvas tests and add v8 ignore for unreachable branches):src/email-builder/__tests__/builder-canvas.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBlock } from '../block-registry.js';
import { BuilderCanvas } from '../builder-canvas.js';
import { BuilderDndWrapper } from '../internal/dnd-wrapper.js';
import { defaultEmailBuilderLabels } from '../types.js';
=======
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createBlock } from '../block-registry.js';
import { BuilderCanvas } from '../builder-canvas.js';
import { BuilderDndWrapper } from '../internal/dnd-wrapper.js';
import type { EmailBlock } from '../types.js';
import { defaultEmailBuilderLabels } from '../types.js';
>>>>>>> 5f920f1 (Expand builder-canvas tests and add v8 ignore for unreachable branches):src/email-builder/__tests__/builder-canvas.test.tsx

const labels = defaultEmailBuilderLabels;

describe('BuilderCanvas', () => {
  it('shows the empty state when there are no blocks', () => {
    render(
      <BuilderDndWrapper blockIds={[]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={labels}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByText(labels.emptyTitle)).toBeInTheDocument();
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
          labels={labels}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('calls onSelectBlock when a block select button is clicked', () => {
    const block = createBlock('heading', { text: 'Click me' });
    const onSelectBlock = vi.fn();
    render(
      <BuilderDndWrapper blockIds={[block.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[block]}
          selectedBlockId={null}
          onSelectBlock={onSelectBlock}
          device="desktop"
          labels={labels}
        />
      </BuilderDndWrapper>
    );
    const selectBtn = document.querySelector(
      '[data-slot="email-builder-canvas-block-select"]'
    ) as HTMLElement;
    expect(selectBtn).toBeTruthy();
    fireEvent.click(selectBtn);
    expect(onSelectBlock).toHaveBeenCalledWith(block.id);
  });

  it('renders the floating bar when a block is selected and renderFloatingBar is provided', () => {
    const block = createBlock('heading', { text: 'Selected' });
    render(
      <BuilderDndWrapper blockIds={[block.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[block]}
          selectedBlockId={block.id}
          onSelectBlock={() => {}}
          device="desktop"
          labels={labels}
          renderFloatingBar={(_b: EmailBlock) => <div data-testid="floating-bar">actions</div>}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByTestId('floating-bar')).toBeInTheDocument();
  });

  it('does not render the floating bar when no block is selected', () => {
    const block = createBlock('heading', { text: 'Not selected' });
    render(
      <BuilderDndWrapper blockIds={[block.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[block]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={labels}
          renderFloatingBar={(_b: EmailBlock) => <div data-testid="floating-bar">actions</div>}
        />
      </BuilderDndWrapper>
    );
    expect(screen.queryByTestId('floating-bar')).not.toBeInTheDocument();
  });

  it('renders the emptyStateAction in the empty state', () => {
    render(
      <BuilderDndWrapper blockIds={[]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={labels}
          emptyStateAction={<button type="button">Add first block</button>}
        />
      </BuilderDndWrapper>
    );
    expect(screen.getByText('Add first block')).toBeInTheDocument();
  });

  it('stops propagation when the floating bar action wrapper is clicked', () => {
    const block = createBlock('heading', { text: 'With bar' });
    const onSelectBlock = vi.fn();
    render(
      <BuilderDndWrapper blockIds={[block.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[block]}
          selectedBlockId={block.id}
          onSelectBlock={onSelectBlock}
          device="desktop"
          labels={labels}
          renderFloatingBar={(_b: EmailBlock) => <div>bar</div>}
        />
      </BuilderDndWrapper>
    );
    const actionsWrapper = document.querySelector(
      '[data-slot="email-builder-canvas-block-actions"]'
    ) as HTMLElement;
    expect(actionsWrapper).toBeTruthy();
    fireEvent.click(actionsWrapper);
    // onSelectBlock should NOT be called since we stopPropagation inside the wrapper
    expect(onSelectBlock).not.toHaveBeenCalled();
  });

  it('stops propagation on pointerDown inside the floating bar action wrapper', () => {
    const block = createBlock('heading', { text: 'PointerDown test' });
    render(
      <BuilderDndWrapper blockIds={[block.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[block]}
          selectedBlockId={block.id}
          onSelectBlock={() => {}}
          device="desktop"
          labels={labels}
          renderFloatingBar={(_b: EmailBlock) => <div>bar</div>}
        />
      </BuilderDndWrapper>
    );
    const actionsWrapper = document.querySelector(
      '[data-slot="email-builder-canvas-block-actions"]'
    ) as HTMLElement;
    expect(actionsWrapper).toBeTruthy();
    // Firing pointerDown on the wrapper should not throw
    fireEvent.pointerDown(actionsWrapper);
  });

  it('uses mobile device width when device is mobile', () => {
    render(
      <BuilderDndWrapper blockIds={[]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="mobile"
          labels={labels}
        />
      </BuilderDndWrapper>
    );
    const frame = document.querySelector('[data-slot="email-builder-canvas-frame"]') as HTMLElement;
    expect(frame.style.maxWidth).toBe('375px');
  });
});
