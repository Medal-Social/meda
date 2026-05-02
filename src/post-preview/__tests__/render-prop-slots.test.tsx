import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import {
  type LinkedInMentionPickerContext,
  LinkedInPreview,
  type LinkedInPreviewProps,
} from '../platforms/index.js';

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
    const renderMentionPicker = vi.fn<(ctx: LinkedInMentionPickerContext) => ReactNode>(() => (
      <div data-testid="picker" />
    ));
    render(<Harness {...BASE_FIXTURE} editable renderMentionPicker={renderMentionPicker} />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    typeAndFireMention(textbox, '@al');
    expect(renderMentionPicker).toHaveBeenCalled();
    const lastCall = renderMentionPicker.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    expect(lastCall?.[0].query).toBe('al');
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
