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
});
