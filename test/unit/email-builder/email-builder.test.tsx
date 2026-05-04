import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { EmailBuilder } from '../../../src/email-builder/email-builder.js';
import type { EmailDocument } from '../../../src/email-builder/types.js';

function Harness({ initial }: { initial: EmailDocument }) {
  const [doc, setDoc] = useState<EmailDocument>(initial);
  return <EmailBuilder document={doc} onDocumentChange={setDoc} />;
}

describe('EmailBuilder', () => {
  it('adds a block when picked from the palette and re-renders the canvas', () => {
    render(<Harness initial={{ blocks: [], envelope: {} }} />);
    expect(screen.getByText('Start your email')).toBeInTheDocument();
    // Multiple "Heading" buttons can exist (palette + perhaps tab); pick the palette item.
    const headingItem = document.querySelector(
      '[data-slot="email-builder-palette-item"][data-block-kind="heading"]'
    ) as HTMLElement;
    expect(headingItem).toBeTruthy();
    fireEvent.click(headingItem);
    expect(screen.queryByText('Start your email')).not.toBeInTheDocument();
    // Default heading text should be visible in the canvas.
    expect(screen.getByText('Your headline')).toBeInTheDocument();
  });

  it('shows the inspector when a block is selected', () => {
    const initial: EmailDocument = { blocks: [], envelope: {} };
    render(<Harness initial={initial} />);
    const headingItem = document.querySelector(
      '[data-slot="email-builder-palette-item"][data-block-kind="heading"]'
    ) as HTMLElement;
    fireEvent.click(headingItem);
    // The new block is auto-selected, so the inspector should now show
    // the heading editor with a "Text" field.
    expect(screen.getByLabelText('Text')).toBeInTheDocument();
  });
});
