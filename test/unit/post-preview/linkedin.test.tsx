import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  type LinkedInMentionData,
  LinkedInPreview,
  type LinkedInPreviewProps,
} from '../../../src/post-preview/platforms/linkedin.js';

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

  it('calls onPick from LinkedIn mention picker inserting mention and calling onMentionsChange', () => {
    let capturedOnPick: ((m: LinkedInMentionData) => void) | undefined;
    const renderMentionPicker = vi.fn(
      (ctx: { query: string; onPick: (m: LinkedInMentionData) => void }) => {
        capturedOnPick = ctx.onPick;
        return <div data-testid="mention-picker" />;
      }
    );
    const onMentionsChange = vi.fn();
    function Harness(props: Omit<LinkedInPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('');
      return (
        <LinkedInPreview
          {...props}
          content={value}
          onContentChange={setValue}
          renderMentionPicker={renderMentionPicker}
          onMentionsChange={onMentionsChange}
        />
      );
    }
    render(<Harness {...FIXTURE} editable />);
    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textbox, { target: { value: '@jan' } });
    textbox.setSelectionRange(4, 4);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(capturedOnPick).toBeDefined();
    act(() => {
      capturedOnPick?.({
        offset: 0,
        length: 3,
        urn: 'urn:li:person:abc',
        name: 'Jane',
      });
    });
    expect(onMentionsChange).toHaveBeenCalled();
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('calls onCancel from LinkedIn mention picker to close it', () => {
    let capturedOnCancel: (() => void) | undefined;
    const renderMentionPicker = vi.fn(
      (ctx: { query: string; onPick: (m: LinkedInMentionData) => void; onCancel: () => void }) => {
        capturedOnCancel = ctx.onCancel;
        return <div data-testid="mention-picker" />;
      }
    );
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
    expect(capturedOnCancel).toBeDefined();
    act(() => {
      capturedOnCancel?.();
    });
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('renders 3-image grid for LinkedIn multi-image (3 urls)', () => {
    render(
      <LinkedInPreview
        {...FIXTURE}
        mediaUrls={[
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ]}
      />
    );
    // avatar + 3 media = 4 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });

  it('renders 2x2 grid with overflow label for 5+ LinkedIn media', () => {
    const urls = Array.from({ length: 5 }, (_, i) => `https://example.com/${i}.jpg`);
    render(<LinkedInPreview {...FIXTURE} mediaUrls={urls} />);
    // avatar + 4 media = 5 total; overflow indicator shows +1
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders 2x2 grid for exactly 4 LinkedIn media (no overflow)', () => {
    const urls = Array.from({ length: 4 }, (_, i) => `https://example.com/${i}.jpg`);
    render(<LinkedInPreview {...FIXTURE} mediaUrls={urls} />);
    // avatar + 4 media = 5 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
  });

  it('renders trailing text segment after all mentions in MentionedContent', () => {
    const mentions: LinkedInMentionData[] = [
      { offset: 0, length: 4, urn: 'urn:li:person:1', name: 'Jane' },
    ];
    const { container } = render(
      <LinkedInPreview {...FIXTURE} content="Jane and team" mentions={mentions} />
    );
    // The full content renders as "Jane and team" — confirm the trailing segment is present
    expect(container.textContent).toContain(' and team');
    // And the mention token was highlighted
    const mentionToken = container.querySelector('[data-slot="linkedin-mention"]');
    expect(mentionToken?.textContent).toBe('Jane');
  });

  it('opens mention picker when @ is after whitespace (not at position 0)', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker-mid" />);
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
    // @ at position 6, preceded by space
    fireEvent.change(textbox, { target: { value: 'hello @ja' } });
    textbox.setSelectionRange(9, 9);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    expect(renderMentionPicker).toHaveBeenCalled();
  });

  it('mention at end of content (no trailing text, cursor === text.length branch)', () => {
    // Mention spans the entire text — no trailing text after the mention
    const mentions: LinkedInMentionData[] = [
      { offset: 0, length: 4, urn: 'urn:li:person:1', name: 'Jane' },
    ];
    const { container } = render(
      <LinkedInPreview {...FIXTURE} content="Jane" mentions={mentions} />
    );
    // Only the mention token, no trailing text
    const mentionToken = container.querySelector('[data-slot="linkedin-mention"]');
    expect(mentionToken?.textContent).toBe('Jane');
  });

  it('closes mention picker when typing plain text without @ trigger', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker" />);
    function Harness(props: Omit<LinkedInPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('@jan');
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
    textbox.setSelectionRange(4, 4);
    fireEvent.input(textbox);
    // Clear the @ trigger
    fireEvent.change(textbox, { target: { value: 'hello world' } });
    textbox.setSelectionRange(11, 11);
    fireEvent.input(textbox);
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('does not open mention picker when @ is embedded in a word without preceding whitespace', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker" />);
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
    // 'abc@jan' — @ at position 3, preceded by 'c' (not whitespace, not start)
    fireEvent.change(textbox, { target: { value: 'abc@jan' } });
    textbox.setSelectionRange(7, 7);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    // Picker should NOT open because @ is not at start or after whitespace
    expect(screen.queryByTestId('mention-picker')).toBeNull();
  });

  it('does not call close when picker is already closed and no @ trigger found (foundAt=-1, isOpen=false)', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-picker" />);
    function Harness(props: Omit<LinkedInPreviewProps, 'content' | 'onContentChange'>) {
      const [value, setValue] = useState('hello');
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
    // Picker never opened — type plain text and fire input (isOpen=false, foundAt=-1)
    textbox.setSelectionRange(5, 5);
    fireEvent.input(textbox);
    fireEvent.keyUp(textbox);
    // Picker should remain absent (close() was not called, picker was never open)
    expect(screen.queryByTestId('mention-picker')).toBeNull();
    expect(renderMentionPicker).not.toHaveBeenCalled();
  });

  it('invokes sort comparator when rendering multiple LinkedIn mentions', () => {
    // "Jane and Bob" — Jane at 0–3, Bob at 9–11
    const mentions: LinkedInMentionData[] = [
      { offset: 9, length: 3, urn: 'urn:li:person:2', name: 'Bob' },
      { offset: 0, length: 4, urn: 'urn:li:person:1', name: 'Jane' },
    ];
    const { container } = render(
      <LinkedInPreview {...FIXTURE} content="Jane and Bob" mentions={mentions} />
    );
    // Both mentions should be rendered as tokens (sort comparator is invoked)
    const tokens = container.querySelectorAll('[data-slot="linkedin-mention"]');
    expect(tokens.length).toBe(2);
    expect(Array.from(tokens).some((t) => t.textContent === 'Jane')).toBe(true);
    expect(Array.from(tokens).some((t) => t.textContent === 'Bob')).toBe(true);
  });
});
