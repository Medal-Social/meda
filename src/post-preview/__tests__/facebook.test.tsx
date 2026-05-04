import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FacebookPreview } from '../platforms/facebook.js';

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
});
