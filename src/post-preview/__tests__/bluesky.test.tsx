import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlueSkyPreview } from '../platforms/bluesky.js';

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
});
