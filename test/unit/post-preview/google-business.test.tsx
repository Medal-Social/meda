import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GoogleBusinessPreview } from '../../../src/post-preview/platforms/google-business.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Google Business!',
};

describe('GoogleBusinessPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<GoogleBusinessPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/Hello from Google Business/)).toBeInTheDocument();
  });

  it('falls back to Building2 icon when avatarUrl is missing', () => {
    const { container } = render(<GoogleBusinessPreview {...FIXTURE} avatarUrl={undefined} />);
    // The fallback is a <span aria-label> wrapping a Building2 SVG, not initials
    expect(container.querySelector('[aria-label="Acme Studios"]')).not.toBeNull();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<GoogleBusinessPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<GoogleBusinessPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<GoogleBusinessPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="google_business"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });
});
