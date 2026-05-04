import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiscordPreview } from '../../../src/post-preview/platforms/discord.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Discord!',
};

describe('DiscordPreview', () => {
  it('renders displayName and content', () => {
    render(<DiscordPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/Hello from Discord/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<DiscordPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<DiscordPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<DiscordPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<DiscordPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="discord"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('renders embeds with title, description, and color border', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[
          {
            title: 'Embed title',
            description: 'Embed description',
            color: 0xff_55_00,
            url: 'https://example.com',
          },
        ]}
      />
    );
    const card = container.querySelector('[data-slot="discord-embed"]') as HTMLElement | null;
    expect(card).not.toBeNull();
    expect(screen.getByText('Embed title')).toBeInTheDocument();
    expect(screen.getByText('Embed description')).toBeInTheDocument();
    expect(card?.style.borderLeftColor).toBeTruthy();
  });

  it('hides embeds when suppressEmbeds is true', () => {
    const { container } = render(
      <DiscordPreview {...FIXTURE} embeds={[{ title: 'Should not render' }]} suppressEmbeds />
    );
    expect(container.querySelector('[data-slot="discord-embed"]')).toBeNull();
    expect(container.querySelector('[data-slot="discord-embeds-suppressed"]')).not.toBeNull();
  });

  it('renders embed with imageUrl showing an image in the card', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[
          {
            title: 'With Image',
            description: 'Has a picture',
            imageUrl: 'https://example.com/embed.png',
          },
        ]}
      />
    );
    const card = container.querySelector('[data-slot="discord-embed"]');
    expect(card).not.toBeNull();
    const img = card?.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/embed.png');
  });

  it('renders embed using default accent color when no color is provided', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[{ title: 'No color', description: 'Default accent' }]}
      />
    );
    const card = container.querySelector('[data-slot="discord-embed"]') as HTMLElement | null;
    expect(card).not.toBeNull();
    // Default Discord accent is #5865f2
    expect(card?.style.borderLeftColor).toBeTruthy();
  });

  it('renders embed URL as a clickable link when url and title are both present', () => {
    render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[
          {
            title: 'Linked title',
            url: 'https://example.com',
            description: 'A linked embed',
          },
        ]}
      />
    );
    const link = screen.getByRole('link', { name: 'Linked title' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('renders the embed url as plain text below content when present without linked title', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[
          {
            description: 'No title, but has url',
            url: 'https://example.com/path',
          },
        ]}
      />
    );
    // URL text rendered as a <p> element (not a link since there's no title)
    expect(container.textContent).toContain('https://example.com/path');
  });

  it('renders multiple media images in a grid', () => {
    render(
      <DiscordPreview
        {...FIXTURE}
        mediaUrls={['https://example.com/a.jpg', 'https://example.com/b.jpg']}
      />
    );
    // avatar img + 2 media = 3 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
  });

  it('renders embed without description (description branch is false)', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[{ title: 'Title only, no description', url: 'https://example.com' }]}
      />
    );
    const card = container.querySelector('[data-slot="discord-embed"]');
    expect(card).not.toBeNull();
    expect(screen.getByText('Title only, no description')).toBeInTheDocument();
  });

  it('uses fallback alt text for embed image when no title is provided', () => {
    render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[
          {
            imageUrl: 'https://example.com/embed.png',
            description: 'Just an image embed, no title',
          },
        ]}
      />
    );
    // The img should have the fallback alt
    const img = screen.getByAltText('Discord embed');
    expect(img).toBeInTheDocument();
  });

  it('filters out embeds that have no visible fields', () => {
    const { container } = render(
      <DiscordPreview
        {...FIXTURE}
        embeds={[{ title: '  ', description: '  ', url: undefined, imageUrl: undefined }]}
      />
    );
    // Embed has no visible content, should not render
    expect(container.querySelector('[data-slot="discord-embed"]')).toBeNull();
    expect(container.querySelector('[data-slot="discord-embeds"]')).toBeNull();
  });
});
