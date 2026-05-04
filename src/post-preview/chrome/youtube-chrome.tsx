import { Bell, Menu, Mic, Search, Upload } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface YouTubeChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  ariaLabel?: string;
  searchLabel?: string;
}

/**
 * YouTube chrome: top header (logo, search, actions) + category chips +
 * content area. Honors `.dark` for the dark variant.
 */
export function YouTubeChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'YouTube preview',
  searchLabel = 'Search',
}: YouTubeChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-white dark:bg-[#0f0f0f]', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white dark:border-gray-800 dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex items-center gap-0.5">
              <svg className="h-5 w-8" viewBox="0 0 90 20" fill="none" aria-hidden="true">
                <path
                  d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10Z"
                  fill="#FF0000"
                />
                <path d="m7.5 13.5 5-3.5-5-3.5v7Z" fill="#fff" />
              </svg>
            </div>
          </div>

          <div className="mx-8 flex max-w-xl flex-1 items-center">
            <div className="flex flex-1 items-center overflow-hidden rounded-l-full border border-gray-300 dark:border-gray-700">
              <input
                type="text"
                placeholder={searchLabel}
                className="flex-1 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 outline-none dark:bg-[#121212] dark:text-white"
                aria-label={searchLabel}
                readOnly
              />
            </div>
            <button
              type="button"
              className="rounded-r-full border border-gray-300 border-l-0 bg-gray-100 px-5 py-2 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              type="button"
              className="ml-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Search with voice"
            >
              <Mic className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Upload"
            >
              <Upload className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              type="button"
              className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[8px] text-white">
                5
              </span>
            </button>
            <Avatar src={avatarUrl} displayName={displayName} className="ml-2 h-8 w-8" />
          </div>
        </div>
      </header>

      <main className="bg-white dark:bg-[#0f0f0f]">{children}</main>
    </section>
  );
}
