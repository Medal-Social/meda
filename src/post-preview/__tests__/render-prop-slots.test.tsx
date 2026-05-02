import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import { LinkedInPreview, type LinkedInPreviewProps } from '../index.js';

function Harness(props: Omit<LinkedInPreviewProps, 'content' | 'onContentChange'>) {
  const [value, setValue] = useState('');
  return <LinkedInPreview {...props} content={value} onContentChange={setValue} />;
}

function typeAndFireMention(textbox: HTMLTextAreaElement, value: string) {
  fireEvent.change(textbox, { target: { value } });
  textbox.setSelectionRange(value.length, value.length);
  fireEvent.input(textbox);
  fireEvent.keyUp(textbox);
}

describe('LinkedIn renderMentionPicker slot', () => {
  it('is invoked with query / onPick / onCancel when @ is typed', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="picker" />);
    render(<Harness {...BASE_FIXTURE} editable renderMentionPicker={renderMentionPicker} />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    typeAndFireMention(textbox, '@al');
    expect(renderMentionPicker).toHaveBeenCalled();
    const ctx = renderMentionPicker.mock.lastCall?.[0] as { query: string };
    expect(ctx.query).toBe('al');
    expect(screen.getByTestId('picker')).toBeInTheDocument();
  });

  it('does not render anything when no slot is provided', () => {
    render(<Harness {...BASE_FIXTURE} editable />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    typeAndFireMention(textbox, '@a');
    expect(screen.queryByTestId('picker')).toBeNull();
    expect(textbox).toHaveValue('@a');
  });
});
