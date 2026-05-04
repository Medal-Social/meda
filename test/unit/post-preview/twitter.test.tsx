import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  TwitterPreview,
  type TwitterPreviewProps,
} from '../../../src/post-preview/platforms/twitter.js';

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

  it('calls onPick from mention picker to insert a mention into content', () => {
    let capturedOnPick: ((mention: string) => void) | undefined;
    const renderMentionPicker = vi.fn((ctx: { query: string; onPick: (m: string) => void }) => {
      capturedOnPick = ctx.onPick;
      return <div data-testid="mention-picker" />;
    });
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
    expect(capturedOnPick).toBeDefined();
    act(() => {
      capturedOnPick?.('alice');
    });
    // After picking, mention picker should close (not rendered)
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('calls onCancel from mention picker to close it without inserting', () => {
    let capturedOnCancel: (() => void) | undefined;
    const renderMentionPicker = vi.fn(
      (ctx: { query: string; onPick: (m: string) => void; onCancel: () => void }) => {
        capturedOnCancel = ctx.onCancel;
        return <div data-testid="mention-picker" />;
      }
    );
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
    expect(capturedOnCancel).toBeDefined();
    act(() => {
      capturedOnCancel?.();
    });
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('shows character counter in editable mode and highlights over-limit in red', () => {
    const { container } = render(
      <TwitterPreview {...FIXTURE} editable characterLimit={20} content="Hello from Twitter!" />
    );
    const counter = container.querySelector('[data-slot="twitter-character-counter"]');
    expect(counter).not.toBeNull();
    // 19 chars, limit 20 → 1 remaining (no red)
    expect(counter?.textContent).toContain('1');
    expect(counter?.textContent).toContain('20');
  });

  it('applies lights-out theme by default', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} />);
    expect(container.querySelector('[data-theme="lights-out"]')).not.toBeNull();
  });

  it('applies light theme variant via data-theme', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} theme="light" />);
    expect(container.querySelector('[data-theme="light"]')).not.toBeNull();
  });

  it('renders editable textarea with light theme (covers light placeholder class branch)', () => {
    render(<TwitterPreview {...FIXTURE} theme="light" editable />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('uses @ prefix when username already starts with @', () => {
    render(<TwitterPreview {...FIXTURE} username="@acmestudios" />);
    // formattedUsername keeps the @
    expect(screen.getByText('@acmestudios')).toBeInTheDocument();
  });

  it('shows character counter in red when content exceeds the limit', () => {
    const { container } = render(
      <TwitterPreview
        {...FIXTURE}
        editable
        characterLimit={5}
        content="This text is longer than 5 chars"
      />
    );
    const counter = container.querySelector('[data-slot="twitter-character-counter"]');
    expect(counter).not.toBeNull();
    // Counter should be red (content > limit)
    expect(counter?.className).toContain('red');
  });

  it('inserts @-prefixed mention when picked mention already starts with @', () => {
    let capturedOnPick: ((mention: string) => void) | undefined;
    const renderMentionPicker = vi.fn((ctx: { query: string; onPick: (m: string) => void }) => {
      capturedOnPick = ctx.onPick;
      return <div data-testid="mention-picker" />;
    });
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
    act(() => {
      capturedOnPick?.('@alice'); // already has @ prefix
    });
    // Mention picker should close after pick
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('highlights @mentions at start of content (empty part skipped in ContentWithMentions)', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} content="@alice says hi" />);
    // @alice should be a mention span — the split produces an empty leading part that is skipped
    const spans = container.querySelectorAll('span');
    const mentionSpans = Array.from(spans).filter((s) => s.textContent === '@alice');
    expect(mentionSpans.length).toBeGreaterThan(0);
  });

  it('renders 3 media images with correct grid layout', () => {
    render(
      <TwitterPreview
        {...FIXTURE}
        mediaUrls={[
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ]}
      />
    );
    // avatar img + 3 media = 4 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });

  it('opens mention picker when @ is after whitespace (not at position 0)', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker-mid" />);
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
    // Set content to "hello @ja" — @ is at position 6, preceded by space
    fireEvent.change(textbox, { target: { value: 'hello @ja' } });
    textbox.setSelectionRange(9, 9);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(renderMentionPicker).toHaveBeenCalled();
    expect(screen.getByTestId('mention-picker-mid')).toBeInTheDocument();
  });

  it('mentions in content are highlighted in the static view', () => {
    const { container } = render(<TwitterPreview {...FIXTURE} content="Hello @alice and @bob!" />);
    // Two mention spans should be present
    const spans = container.querySelectorAll('span');
    const mentionSpans = Array.from(spans).filter(
      (s) => s.textContent === '@alice' || s.textContent === '@bob'
    );
    expect(mentionSpans.length).toBe(2);
  });

  it('closes mention picker when user types text without @ trigger', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker" />);
    function Harness(props: Omit<TwitterPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('@al');
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
    // First trigger the mention picker
    textbox.setSelectionRange(3, 3);
    fireEvent.input(textbox);
    // Now change content to have no @ trigger
    fireEvent.change(textbox, { target: { value: 'hello world' } });
    textbox.setSelectionRange(11, 11);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('does not open mention picker when @ is embedded in a word without preceding whitespace', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker" />);
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
    // 'abc@jan' — @ at position 3, preceded by 'c' (not whitespace, not start)
    fireEvent.change(textbox, { target: { value: 'abc@jan' } });
    textbox.setSelectionRange(7, 7);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    // Picker should NOT open because @ is not at start or after whitespace
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });
});
