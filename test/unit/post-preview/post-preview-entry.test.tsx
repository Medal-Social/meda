import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PostPreview } from '../../../src/post-preview/post-preview.js';

const BASE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello world!',
};

describe('PostPreview entry point (renderPlatform switch + slot rendering)', () => {
  // Cover renderPlatform switch cases not yet exercised via the top-level component.
  it('routes to FacebookPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="facebook" />);
    expect(container.querySelector('[data-platform="facebook"]')).not.toBeNull();
  });

  it('routes to LinkedInPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="linkedin" />);
    expect(container.querySelector('[data-platform="linkedin"]')).not.toBeNull();
  });

  it('routes to TikTokPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="tiktok" />);
    expect(container.querySelector('[data-platform="tiktok"]')).not.toBeNull();
  });

  it('routes to YouTubePreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="youtube" />);
    expect(container.querySelector('[data-platform="youtube"]')).not.toBeNull();
  });

  it('routes to ThreadsPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="threads" />);
    expect(container.querySelector('[data-platform="threads"]')).not.toBeNull();
  });

  it('routes to BlueSkyPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="bluesky" />);
    expect(container.querySelector('[data-platform="bluesky"]')).not.toBeNull();
  });

  it('routes to DiscordPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="discord" />);
    expect(container.querySelector('[data-platform="discord"]')).not.toBeNull();
  });

  it('routes to TelegramPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="telegram" />);
    expect(container.querySelector('[data-platform="telegram"]')).not.toBeNull();
  });

  it('routes to GoogleBusinessPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="google_business" />);
    expect(container.querySelector('[data-platform="google_business"]')).not.toBeNull();
  });

  it('routes to GenericPreview', () => {
    const { container } = render(<PostPreview {...BASE} platform="generic" />);
    expect(container.querySelector('[data-platform="generic"]')).not.toBeNull();
  });

  it('renders the plain preview element when no editor or toolbar slots are provided', () => {
    const { container } = render(<PostPreview {...BASE} platform="twitter" />);
    // Should render TwitterPreview directly, not wrapped in meda-post-preview div
    expect(container.querySelector('.meda-post-preview')).toBeNull();
    expect(container.querySelector('[data-platform="twitter"]')).not.toBeNull();
  });

  it('wraps in meda-post-preview when renderEditor is provided', () => {
    const renderEditor = vi.fn(() => <div data-testid="custom-editor" />);
    const { container } = render(
      <PostPreview {...BASE} platform="twitter" mode="edit" renderEditor={renderEditor} />
    );
    expect(container.querySelector('.meda-post-preview')).not.toBeNull();
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
  });

  it('renders toolbar with media picker when mode=edit and renderMediaPicker provided', () => {
    const renderMediaPicker = vi.fn(() => <button type="button">Pick media</button>);
    const { container } = render(
      <PostPreview {...BASE} platform="twitter" mode="edit" renderMediaPicker={renderMediaPicker} />
    );
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    expect(screen.getByText('Pick media')).toBeInTheDocument();
  });

  it('renders toolbar with emoji picker and fires onSelect callback on emoji pick', () => {
    const onContentChange = vi.fn();
    const renderEmojiPicker = vi.fn(({ onSelect }: { onSelect: (emoji: string) => void }) => (
      <button type="button" onClick={() => onSelect('🎉')}>
        Pick emoji
      </button>
    ));
    render(
      <PostPreview
        {...BASE}
        platform="twitter"
        mode="edit"
        content="Hello"
        onContentChange={onContentChange}
        renderEmojiPicker={renderEmojiPicker}
      />
    );
    fireEvent.click(screen.getByText('Pick emoji'));
    expect(onContentChange).toHaveBeenCalledWith('Hello🎉');
  });

  it('emoji picker onSelect does not throw when onContentChange is not provided', () => {
    const renderEmojiPicker = vi.fn(({ onSelect }: { onSelect: (emoji: string) => void }) => (
      <button type="button" onClick={() => onSelect('🎉')}>
        Pick emoji (no onChange)
      </button>
    ));
    render(
      <PostPreview
        {...BASE}
        platform="discord"
        mode="edit"
        renderEmojiPicker={renderEmojiPicker}
        // No onContentChange provided intentionally
      />
    );
    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByText('Pick emoji (no onChange)'));
    }).not.toThrow();
  });

  it('emoji picker onSelect uses empty string fallback when content is nullish', () => {
    const onContentChange = vi.fn();
    const renderEmojiPicker = vi.fn(({ onSelect }: { onSelect: (emoji: string) => void }) => (
      <button type="button" onClick={() => onSelect('🎉')}>
        Pick emoji (null content)
      </button>
    ));
    render(
      <PostPreview
        {...BASE}
        platform="discord"
        mode="edit"
        content={null as unknown as string}
        onContentChange={onContentChange}
        renderEmojiPicker={renderEmojiPicker}
      />
    );
    fireEvent.click(screen.getByText('Pick emoji (null content)'));
    expect(onContentChange).toHaveBeenCalledWith('🎉');
  });

  it('renders toolbar with mention picker slot', () => {
    const renderMentionPicker = vi.fn(() => <div data-testid="mention-slot" />);
    const { container } = render(
      <PostPreview
        {...BASE}
        platform="twitter"
        mode="edit"
        renderMentionPicker={renderMentionPicker}
      />
    );
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    expect(renderMentionPicker).toHaveBeenCalledWith({ platform: 'twitter' });
  });

  it('passes editable=true to the platform when mode=edit and no renderEditor', () => {
    // No renderEditor means the platform itself is editable
    render(
      <PostPreview
        {...BASE}
        platform="twitter"
        mode="edit"
        renderMediaPicker={() => <span>media</span>}
      />
    );
    // The toolbar should appear, and the inner preview should be editable
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renderEditor receives empty string fallback when content is nullish', () => {
    const renderEditor = vi.fn(
      (ctx: { platform: string; value: string; onChange: (v: string) => void }) => {
        // Verify the fallback to '' is applied
        expect(ctx.value).toBe('');
        return <div data-testid="editor">{ctx.value}</div>;
      }
    );
    render(
      <PostPreview
        {...BASE}
        platform="discord"
        mode="edit"
        content={null as unknown as string}
        renderEditor={renderEditor}
      />
    );
    expect(renderEditor).toHaveBeenCalled();
  });

  it('renderEditor onChange callback calls onContentChange prop', () => {
    let capturedOnChange: ((v: string) => void) | undefined;
    const renderEditor = vi.fn(
      (ctx: { platform: string; value: string; onChange: (v: string) => void }) => {
        capturedOnChange = ctx.onChange;
        return <div data-testid="editor" />;
      }
    );
    const onContentChange = vi.fn();
    render(
      <PostPreview
        {...BASE}
        platform="discord"
        mode="edit"
        renderEditor={renderEditor}
        onContentChange={onContentChange}
      />
    );
    expect(capturedOnChange).toBeDefined();
    act(() => {
      capturedOnChange?.('new value');
    });
    expect(onContentChange).toHaveBeenCalledWith('new value');
  });

  it('calls onMediaUrlsChange from media picker onPick callback', () => {
    const onMediaUrlsChange = vi.fn();
    const renderMediaPicker = vi.fn(
      ({ onPick }: { platform: string; current?: string[]; onPick: (urls: string[]) => void }) => (
        <button type="button" onClick={() => onPick(['https://example.com/img.jpg'])}>
          Pick
        </button>
      )
    );
    render(
      <PostPreview
        {...BASE}
        platform="twitter"
        mode="edit"
        renderMediaPicker={renderMediaPicker}
        onMediaUrlsChange={onMediaUrlsChange}
      />
    );
    fireEvent.click(screen.getByText('Pick'));
    expect(onMediaUrlsChange).toHaveBeenCalledWith(['https://example.com/img.jpg']);
  });
});
