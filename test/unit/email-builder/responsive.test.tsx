import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBlock } from '../../../src/email-builder/block-registry.js';
import { BuilderCanvas } from '../../../src/email-builder/builder-canvas.js';
import { BuilderDndWrapper } from '../../../src/email-builder/internal/dnd-wrapper.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';

describe('BuilderCanvas (responsive)', () => {
  it('respects the desktop frame width', () => {
    const a = createBlock('heading');
    const { container } = render(
      <BuilderDndWrapper blockIds={[a.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[a]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="desktop"
          labels={defaultEmailBuilderLabels}
        />
      </BuilderDndWrapper>
    );
    const frame = container.querySelector(
      '[data-slot="email-builder-canvas-frame"]'
    ) as HTMLElement;
    expect(frame.style.maxWidth).toBe('600px');
  });

  it('respects the mobile frame width', () => {
    const a = createBlock('heading');
    const { container } = render(
      <BuilderDndWrapper blockIds={[a.id]} onDragEnd={() => {}}>
        <BuilderCanvas
          blocks={[a]}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          device="mobile"
          labels={defaultEmailBuilderLabels}
        />
      </BuilderDndWrapper>
    );
    const frame = container.querySelector(
      '[data-slot="email-builder-canvas-frame"]'
    ) as HTMLElement;
    expect(frame.style.maxWidth).toBe('375px');
  });
});
