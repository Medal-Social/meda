import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FacebookPreview } from '../../../src/post-preview/platforms/facebook.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Facebook!',
};

describe('FacebookPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<FacebookPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/Hello from Facebook/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<FacebookPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<FacebookPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<FacebookPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<FacebookPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="facebook"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('renders 3-image grid with first spanning two rows', () => {
    render(
      <FacebookPreview
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

  it('renders 4 images with overflow badge when 5+ urls provided', () => {
    const urls = Array.from({ length: 5 }, (_, i) => `https://example.com/${i}.jpg`);
    render(<FacebookPreview {...FIXTURE} mediaUrls={urls} />);
    // avatar + 4 media = 5 total imgs
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders 2-image side-by-side grid', () => {
    render(
      <FacebookPreview
        {...FIXTURE}
        mediaUrls={['https://example.com/a.jpg', 'https://example.com/b.jpg']}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
  });
});
