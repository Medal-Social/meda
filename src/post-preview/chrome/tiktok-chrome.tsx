import { Home, MessageCircle, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface TikTokChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  ariaLabel?: string;
  followingLabel?: string;
  forYouLabel?: string;
  homeLabel?: string;
  discoverLabel?: string;
  inboxLabel?: string;
  profileLabel?: string;
}

/**
 * TikTok chrome: dark-themed top tabs (Following / For You) and bottom tab bar
 * with the signature TikTok create button.
 */
export function TikTokChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'TikTok preview',
  followingLabel = 'Following',
  forYouLabel = 'For You',
  homeLabel = 'Home',
  discoverLabel = 'Discover',
  inboxLabel = 'Inbox',
  profileLabel = 'Profile',
}: TikTokChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-black', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2"
            aria-label="Live"
          >
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>

          <div className="flex items-center gap-6">
            <button type="button" className="font-semibold text-base text-gray-300">
              {followingLabel}
            </button>
            <span className="text-gray-500" aria-hidden="true">
              |
            </span>
            <button type="button" className="relative font-bold text-base text-white">
              {forYouLabel}
              <div className="-bottom-1 absolute right-0 left-0 h-0.5 bg-white" />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2"
            aria-label="Search"
          >
            <Search className="h-6 w-6 text-white" />
          </button>
        </div>
      </header>

      <main className="bg-black">{children}</main>

      <nav className="sticky bottom-0 border-gray-800 border-t bg-black">
        <div className="flex items-center justify-around py-2">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1 p-2"
          >
            <Home className="h-6 w-6 text-white" fill="currentColor" />
            <span className="text-[10px] text-white">{homeLabel}</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1 p-2"
          >
            <Search className="h-6 w-6 text-gray-300" />
            <span className="text-[10px] text-gray-300">{discoverLabel}</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2"
            aria-label="Create"
          >
            <div className="relative h-10 w-12">
              <div className="-translate-y-1/2 absolute top-1/2 left-0 h-7 w-10 rounded-lg bg-[#25F4EE]" />
              <div className="-translate-y-1/2 absolute top-1/2 right-0 h-7 w-10 rounded-lg bg-[#FE2C55]" />
              <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-7 w-10 items-center justify-center rounded-lg bg-white">
                <Plus className="h-5 w-5 text-black" strokeWidth={3} />
              </div>
            </div>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1 p-2"
          >
            <MessageCircle className="h-6 w-6 text-gray-300" />
            <span className="text-[10px] text-gray-300">{inboxLabel}</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1 p-2"
          >
            <Avatar
              src={avatarUrl}
              displayName={displayName}
              className="h-6 w-6 ring-2 ring-white"
            />
            <span className="text-[10px] text-gray-300">{profileLabel}</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
