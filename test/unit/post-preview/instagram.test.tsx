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

  it('renders story layout when instagramPostType="story"', () => {
    const { container } = render(<InstagramPreview {...FIXTURE} instagramPostType="story" />);
    expect(
      container.querySelector('[data-platform="instagram"][data-instagram-post-type="story"]')
    ).not.toBeNull();
  });

  it('renders story layout with media when instagramPostType="story" and mediaUrls provided', () => {
    const { container } = render(
      <InstagramPreview
        {...FIXTURE}
        instagramPostType="story"
        mediaUrls={['https://example.com/story.jpg']}
      />
    );
    const img = container.querySelector('img[alt="Story"]');
    expect(img).not.toBeNull();
  });

  it('renders username with @ stripped when username starts with @', () => {
    render(<InstagramPreview {...FIXTURE} username="@acmestudios" />);
    // Should display 'acmestudios' not '@acmestudios'
    expect(screen.getAllByText('acmestudios').length).toBeGreaterThan(0);
  });

  it('renders reel with empty content (null branch for content)', () => {
    const { container } = render(
      <InstagramPreview {...FIXTURE} instagramPostType="reel" content="" />
    );
    // No content paragraph rendered
    expect(container.querySelector('[data-instagram-post-type="reel"]')).not.toBeNull();
    // The content <p> should not exist
    const reelEl = container.querySelector('[data-instagram-post-type="reel"]');
    const contentP = reelEl?.querySelector('.line-clamp-2');
    expect(contentP).toBeNull();
  });

  it('renders reel without media (placeholder) when no mediaUrls', () => {
    const { container } = render(
      <InstagramPreview {...FIXTURE} instagramPostType="reel" mediaUrls={undefined} />
    );
    expect(container.querySelector('[data-instagram-post-type="reel"]')).not.toBeNull();
    // No img element for the reel background
    const img = container.querySelector('img[alt="Reel"]');
    expect(img).toBeNull();
  });

  it('renders reel with media when instagramPostType="reel" and mediaUrls provided', () => {
    const { container } = render(
      <InstagramPreview
        {...FIXTURE}
        instagramPostType="reel"
        mediaUrls={['https://example.com/reel.mp4']}
      />
    );
    const img = container.querySelector('img[alt="Reel"]');
    expect(img).not.toBeNull();
  });

  it('renders media placeholder when no media provided for feed', () => {
    const { container } = render(<InstagramPreview {...FIXTURE} mediaUrls={undefined} />);
    // Should show the add image placeholder label
    expect(container.querySelector('[data-platform="instagram"]')).not.toBeNull();
    expect(screen.getByText('Add an image to preview')).toBeInTheDocument();
  });

  it('shows overflow dot when carousel has more than 5 slides', () => {
    const urls = Array.from({ length: 6 }, (_, i) => `https://example.com/${i}.jpg`);
    const { container } = render(<InstagramPreview {...FIXTURE} mediaUrls={urls} />);
    // Overflow dot is rendered for >5 media in carousel dot nav
    const overflowDot = container.querySelector(
      'span[aria-hidden="true"].rounded-full.bg-white\\/40'
    );
    expect(overflowDot).not.toBeNull();
  });
});
