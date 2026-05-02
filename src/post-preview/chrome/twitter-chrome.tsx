import { Bell, Home, Mail, Search, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface TwitterChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  /** Accessible region label override. */
  ariaLabel?: string;
  forYouLabel?: string;
  followingLabel?: string;
  composeLabel?: string;
}

/**
 * Twitter / X chrome: dark-themed top header with X logo + tabs and a
 * bottom navigation bar. Wraps any preview as the page body.
 */
export function TwitterChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'Twitter preview',
  forYouLabel = 'For you',
  followingLabel = 'Following',
  composeLabel = 'Post',
}: TwitterChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-black', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-800 border-b bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" className="p-0" aria-label="Profile">
            <Avatar src={avatarUrl} displayName={displayName} className="h-8 w-8" />
          </button>

          <svg
            className="h-7 w-7 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>

          <button
            type="button"
            className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white hover:bg-gray-800"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="flex">
          <button
            type="button"
            className="relative min-h-11 flex-1 py-4 text-center font-bold text-[15px] text-white"
          >
            {forYouLabel}
            <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-1 w-14 rounded-full bg-blue-500" />
          </button>
          <button
            type="button"
            className="min-h-11 flex-1 py-4 text-center text-[15px] text-gray-500 hover:bg-gray-900/50"
          >
            {followingLabel}
          </button>
        </div>
      </header>

      <main>{children}</main>

      <button
        type="button"
        className="fixed right-4 bottom-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg hover:bg-blue-600"
        aria-label={composeLabel}
      >
        <svg
          className="h-6 w-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-2v2h-2v-2H10V9h2V7h2v2h2v2z" />
        </svg>
      </button>

      <nav className="sticky bottom-0 border-gray-800 border-t bg-black">
        <div className="flex items-center justify-around py-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-white"
            aria-label="Home"
          >
            <Home className="h-6 w-6" fill="currentColor" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500 hover:text-white"
            aria-label="Messages"
          >
            <Mail className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </section>
  );
}
