import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TwitterPreview, type TwitterPreviewProps } from '../platforms/twitter.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Twitter!',
};

describe('TwitterPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<TwitterPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText('@acmestudios')).toBeInTheDocument();
    expect(screen.getByText(/Hello from Twitter/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<TwitterPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<TwitterPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<TwitterPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="twitter"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('applies the dim theme variant via data-theme', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} theme="dim" />);
    expect(container.querySelector('[data-platform="twitter"][data-theme="dim"]')).not.toBeNull();
  });

  it('invokes renderMentionPicker when the user types @ in editable mode', () => {
    const renderMentionPicker = vi.fn((_ctx: { query: string }) => (
      <div data-testid="mention-picker" />
    ));
    function Harness(props: Omit<TwitterPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('');
      return (
        <TwitterPreview
          {...props}
          content={value}
          onContentChange={setValue}
          renderMentionPicker={renderMentionPicker}
        />
      );
    }
    render(<Harness {...FIXTURE} editable />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textbox, { target: { value: '@al' } });
    textbox.setSelectionRange(3, 3);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(renderMentionPicker).toHaveBeenCalled();
    const lastCall = renderMentionPicker.mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({ query: 'al' });
    expect(screen.getByTestId('mention-picker')).toBeInTheDocument();
  });
});
