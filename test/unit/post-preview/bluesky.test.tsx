import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlueSkyPreview } from '../../../src/post-preview/platforms/bluesky.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from BlueSky!',
};

describe('BlueSkyPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<BlueSkyPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/acmestudios\.bsky\.social/)).toBeInTheDocument();
    expect(screen.getByText(/Hello from BlueSky/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<BlueSkyPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<BlueSkyPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<BlueSkyPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<BlueSkyPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="bluesky"]')).not.toBeNull();
  });

  it('uses username as-is when it already includes a domain', () => {
    render(<BlueSkyPreview {...FIXTURE} username="acme.bsky.team" />);
    expect(screen.getByText('@acme.bsky.team')).toBeInTheDocument();
  });

  it('strips leading @ before appending .bsky.social', () => {
    render(<BlueSkyPreview {...FIXTURE} username="@handle" />);
    expect(screen.getByText('@handle.bsky.social')).toBeInTheDocument();
  });

  it('renders 2-image grid', () => {
    render(
      <BlueSkyPreview
        {...FIXTURE}
        mediaUrls={['https://example.com/a.jpg', 'https://example.com/b.jpg']}
      />
    );
    // avatar img + 2 media imgs = 3 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
  });

  it('renders 3-image grid', () => {
    render(
      <BlueSkyPreview
        {...FIXTURE}
        mediaUrls={[
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ]}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });

  it('renders 4-image grid', () => {
    render(
      <BlueSkyPreview
        {...FIXTURE}
        mediaUrls={[
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
          'https://example.com/d.jpg',
        ]}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
  });
});
