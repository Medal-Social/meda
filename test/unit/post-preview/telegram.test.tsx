import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TelegramPreview } from '../../../src/post-preview/platforms/telegram.js';

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

  it('renders placeholder text for empty poll options', () => {
    render(
      <TelegramPreview {...FIXTURE} content="" poll={{ question: 'Pick one', options: ['', ''] }} />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders multiple media images in a grid', () => {
    render(
      <TelegramPreview
        {...FIXTURE}
        mediaUrls={['https://example.com/a.jpg', 'https://example.com/b.jpg']}
      />
    );
    // avatar img + 2 media = 3 total
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
  });

  it('renders inline keyboard button with callbackData fallback href', () => {
    render(
      <TelegramPreview
        {...FIXTURE}
        replyMarkup={{
          inline_keyboard: [[{ text: 'Action', callbackData: 'do_something' }]],
        }}
      />
    );
    const btn = screen.getByText('Action');
    expect(btn.closest('a')?.getAttribute('href')).toBe('#');
  });

  it('renders button fallback label when button text is empty', () => {
    render(
      <TelegramPreview
        {...FIXTURE}
        replyMarkup={{
          inline_keyboard: [[{ text: '', url: 'https://example.com' }]],
        }}
      />
    );
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('renders keyboard button with no url or callbackData (empty key fallback)', () => {
    render(
      <TelegramPreview
        {...FIXTURE}
        replyMarkup={{
          inline_keyboard: [[{ text: 'Just text' }]],
        }}
      />
    );
    expect(screen.getByText('Just text')).toBeInTheDocument();
  });
});
