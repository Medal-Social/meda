import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TelegramPreview } from '../platforms/telegram.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from Telegram!',
};

describe('TelegramPreview', () => {
  it('renders displayName and content', () => {
    render(<TelegramPreview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/Hello from Telegram/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<TelegramPreview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<TelegramPreview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', () => {
    const onContentChange = vi.fn();
    render(<TelegramPreview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: `${FIXTURE.content}!` } });
    expect(onContentChange).toHaveBeenCalledWith(`${FIXTURE.content}!`);
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<TelegramPreview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="telegram"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
  });

  it('renders a poll with question and options when poll prop is set', () => {
    const { container } = render(
      <TelegramPreview
        {...FIXTURE}
        content=""
        poll={{ question: 'Pick one', options: ['Apple', 'Banana'] }}
      />
    );
    expect(container.querySelector('[data-slot="telegram-poll"]')).not.toBeNull();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders the pin indicator when pinMessage is true', () => {
    const { container } = render(<TelegramPreview {...FIXTURE} pinMessage />);
    expect(container.querySelector('[data-slot="telegram-pinned"]')).not.toBeNull();
    expect(screen.getByText(/Pinned message/)).toBeInTheDocument();
  });

  it('renders inline keyboard buttons from replyMarkup', () => {
    render(
      <TelegramPreview
        {...FIXTURE}
        replyMarkup={{
          inline_keyboard: [
            [
              { text: 'Visit site', url: 'https://example.com' },
              { text: 'Contact', url: 'https://example.com/contact' },
            ],
          ],
        }}
      />
    );
    expect(screen.getByText('Visit site')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
