import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TikTokPreview } from '../../../src/post-preview/platforms/tiktok.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from TikTok!',
};

describe('TikTokPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<TikTokPreview {...FIXTURE} />);
    expect(screen.getByText(/@acmestudios/)).toBeInTheDocument();
    expect(screen.getByText(/Hello from TikTok/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<TikTokPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders even when no media is provided (TikTok overlays caption only)', () => {
    const { container } = render(<TikTokPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="tiktok"]')).not.toBeNull();
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<TikTokPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<TikTokPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="tiktok"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('prepends @ when username does not start with @', () => {
    render(<TikTokPreview {...FIXTURE} username="acmestudios" />);
    expect(screen.getByText('@acmestudios')).toBeInTheDocument();
  });

  it('does not double-prepend @ when username already starts with @', () => {
    render(<TikTokPreview {...FIXTURE} username="@acmestudios" />);
    // Should display @acmestudios, not @@acmestudios
    expect(screen.getByText('@acmestudios')).toBeInTheDocument();
    expect(screen.queryByText('@@acmestudios')).toBeNull();
  });
});
