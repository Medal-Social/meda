import { Bell, Hash, Home, MessageCircle, Search, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface BlueSkyChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  handle?: string;
  className?: string;
  ariaLabel?: string;
  followingLabel?: string;
  discoverLabel?: string;
  composeLabel?: string;
}

/**
 * BlueSky chrome: top header (logo, profile, settings) + feed tabs +
 * floating compose + bottom tab bar.
 */
export function BlueSkyChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'BlueSky preview',
  followingLabel = 'Following',
  discoverLabel = 'Discover',
  composeLabel = 'Compose',
}: BlueSkyChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-white', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-0"
            aria-label="Profile"
          >
            <Avatar src={avatarUrl} displayName={displayName} className="h-8 w-8" />
          </button>

          <svg
            className="h-8 w-8 text-[#1185FE]"
            viewBox="0 0 568 501"
            fill="currentColor"
            role="img"
            aria-label="BlueSky"
          >
            <title>BlueSky</title>
            <path d="M123.121 33.6637C188.241 82.5526 258.281 181.681 284 234.873C309.719 181.681 379.759 82.5526 444.879 33.6637C491.866 -1.61183 568 -28.9064 568 57.9464C568 75.2916 558.896 193.695 552.818 214.479C532.147 284.141 458.392 301.604 392.156 288.962C519.86 308.682 553.879 376.792 465.812 444.901C306.911 566.139 274.195 446.455 266.166 419.418C262.633 407.543 284.001 407.543 284 407.543C283.999 407.543 305.367 407.543 301.834 419.418C293.805 446.455 261.089 566.139 102.188 444.901C14.1208 376.792 48.1402 308.682 175.844 288.962C109.608 301.604 35.8533 284.141 15.182 214.479C9.10404 193.695 0 75.2916 0 57.9464C0 -28.9064 76.1339 -1.61183 123.121 33.6637Z" />
          </svg>

          <button
            type="button"
            className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-gray-200 border-b">
          <button
            type="button"
            className="relative flex-1 py-3 text-center font-semibold text-[#1185FE] text-sm"
          >
            {followingLabel}
            <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-1 w-16 rounded-full bg-[#1185FE]" />
          </button>
          <button
            type="button"
            className="flex-1 py-3 text-center text-gray-500 text-sm hover:bg-gray-50"
          >
            {discoverLabel}
          </button>
        </div>
      </header>

      <main className="bg-white">{children}</main>

      <button
        type="button"
        className="fixed right-4 bottom-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#1185FE] shadow-lg hover:bg-[#0d6efd]"
        aria-label={composeLabel}
      >
        <svg
          className="h-6 w-6 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <nav className="sticky bottom-0 border-gray-200 border-t bg-white">
        <div className="flex items-center justify-around py-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-[#1185FE]"
            aria-label="Home"
          >
            <Home className="h-6 w-6" fill="currentColor" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-gray-700"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-gray-700"
            aria-label="Channels"
          >
            <Hash className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-gray-700"
            aria-label="Messages"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </section>
  );
}
