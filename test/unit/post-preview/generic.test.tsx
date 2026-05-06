import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GenericPreview } from '../../../src/post-preview/platforms/generic.js';

const FIXTURE = {
  platform: 'mastodon',
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Generic!',
};

describe('GenericPreview', () => {
  it('renders displayName, username, and content', () => {
    render(<GenericPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/acmestudios/)).toBeInTheDocument();
    expect(screen.getByText(/Hello from Generic/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<GenericPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<GenericPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<GenericPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<GenericPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="generic"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('uses the PLATFORM_META display name when given a known PlatformId', () => {
    render(<GenericPreview {...FIXTURE} platform="instagram" />);
    expect(screen.getByText(/Instagram preview/)).toBeInTheDocument();
  });
});
