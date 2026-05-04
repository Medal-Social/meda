import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  type LinkedInMentionData,
  LinkedInPreview,
  type LinkedInPreviewProps,
} from '../platforms/linkedin.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'Building software · 2nd',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from LinkedIn!',
};

describe('LinkedInPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<LinkedInPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/Building software/)).toBeInTheDocument();
    expect(screen.getByText(/Hello from LinkedIn/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<LinkedInPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<LinkedInPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<LinkedInPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<LinkedInPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="linkedin"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('renders mention spans as styled tokens in the rendered content', () => {
    const mentions: LinkedInMentionData[] = [
      { offset: 6, length: 4, urn: 'urn:li:person:1', name: 'Jane' },
    ];
    const { container } = render(
      <LinkedInPreview {...FIXTURE} content="Hello Jane and team" mentions={mentions} />
    );
    const tokens = container.querySelectorAll('[data-slot="linkedin-mention"]');
    expect(tokens.length).toBe(1);
    expect(tokens[0]?.textContent).toBe('Jane');
  });

  it('invokes renderMentionPicker when the user types @ in editable mode', () => {
    const renderMentionPicker = vi.fn((_ctx: { query: string }) => (
      <div data-testid="mention-picker" />
    ));
    function Harness(props: Omit<LinkedInPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('');
      return (
        <LinkedInPreview
          {...props}
          content={value}
          onContentChange={setValue}
          renderMentionPicker={renderMentionPicker}
        />
      );
    }
    render(<Harness {...FIXTURE} editable />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textbox, { target: { value: '@jan' } });
    textbox.setSelectionRange(4, 4);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(renderMentionPicker).toHaveBeenCalled();
    const lastCall = renderMentionPicker.mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({ query: 'jan' });
    expect(screen.getByTestId('mention-picker')).toBeInTheDocument();
  });
});
