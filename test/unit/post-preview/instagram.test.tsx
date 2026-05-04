import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstagramPreview } from '../../../src/post-preview/platforms/instagram.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Instagram!',
};

describe('InstagramPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<InstagramPreview {...FIXTURE} />);
    // Username appears in both the header and inline before the caption.
    expect(screen.getAllByText('acmestudios').length).toBeGreaterThan(0);
    expect(screen.getByText(/Hello from Instagram/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<InstagramPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
  });

  it('renders media when mediaUrls is provided', () => {
    render(<InstagramPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<InstagramPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<InstagramPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="instagram"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('renders the reel layout when instagramPostType="reel"', () => {
    const { container } = render(<InstagramPreview {...FIXTURE} instagramPostType="reel" />);
    expect(
      container.querySelector('[data-platform="instagram"][data-instagram-post-type="reel"]')
    ).not.toBeNull();
  });

  it('auto-detects carousel layout when more than one media url is provided', () => {
    const { container } = render(
      <InstagramPreview
        {...FIXTURE}
        mediaUrls={['https://example.com/a.jpg', 'https://example.com/b.jpg']}
      />
    );
    expect(container.querySelector('[data-slot="instagram-carousel-track"]')).not.toBeNull();
    expect(container.querySelector('[data-instagram-post-type="carousel"]')).not.toBeNull();
  });
});
