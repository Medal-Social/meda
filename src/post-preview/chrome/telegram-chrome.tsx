import { ArrowLeft, MoreVertical, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface TelegramChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  channelName?: string;
  subscriberCount?: number;
  className?: string;
  ariaLabel?: string;
  subscribersLabel?: (count: string) => string;
  muteLabel?: string;
}

/**
 * Telegram chrome: blue-themed channel header with avatar, subscriber
 * count, and bottom mute action. Wraps any preview as the chat body.
 */
export function TelegramChrome({
  children,
  avatarUrl,
  channelName = 'Channel',
  subscriberCount = 1234,
  className,
  ariaLabel = 'Telegram preview',
  subscribersLabel = (count) => `${count} subscribers`,
  muteLabel = 'Mute',
}: TelegramChromeProps) {
  const formatted = formatSubscribers(subscriberCount);

  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-[#E7EBF0]', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2">
          <button
            type="button"
            className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-500"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <Avatar src={avatarUrl} displayName={channelName} className="h-10 w-10" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">{channelName}</h1>
            <p className="text-[13px] text-gray-500">{subscribersLabel(formatted)}</p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-500"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-500"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="min-h-[300px] bg-[#E7EBF0] p-4">{children}</main>

      <div className="sticky bottom-0 border-gray-200 border-t bg-white">
        <div className="flex items-center justify-center px-4 py-3">
          <button type="button" className="inline-flex items-center gap-2 text-[#168ACD]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <span className="text-sm">{muteLabel}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
