import { Camera, Heart, Home, PlusSquare, Search, Send } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface InstagramChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  ariaLabel?: string;
  yourStoryLabel?: string;
}

/**
 * Instagram chrome: white top header with logo, stories bar, and bottom
 * tab bar. Wraps any preview as the page body.
 */
export function InstagramChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'Instagram preview',
  yourStoryLabel = 'Your Story',
}: InstagramChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-white', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button type="button" className="p-0" aria-label="Camera">
            <Camera className="h-6 w-6 text-gray-900" />
          </button>

          <span className="font-serif font-semibold text-gray-900 text-xl">Instagram</span>

          <div className="flex items-center gap-4">
            <button type="button" className="relative p-0" aria-label="Activity">
              <Heart className="h-6 w-6 text-gray-900" />
              <span
                className="-top-1 -right-1 absolute h-2.5 w-2.5 rounded-full bg-red-500"
                aria-hidden="true"
              />
            </button>
            <button type="button" className="p-0" aria-label="Messages">
              <Send className="-rotate-12 h-6 w-6 text-gray-900" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto px-4 py-3">
          <div className="flex flex-shrink-0 flex-col items-center gap-1">
            <div className="relative">
              <Avatar
                src={avatarUrl}
                displayName={displayName}
                className="h-16 w-16 ring-2 ring-gray-200 ring-offset-2"
              />
              <div className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-500">
                <span className="font-bold text-white text-xs" aria-hidden="true">
                  +
                </span>
              </div>
            </div>
            <span className="text-[11px] text-gray-900">{yourStoryLabel}</span>
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-shrink-0 flex-col items-center gap-1">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                <div className="h-full w-full rounded-full border-2 border-white bg-gray-200" />
              </div>
              <span className="text-[11px] text-gray-900">user_{i}</span>
            </div>
          ))}
        </div>
      </header>

      <main>{children}</main>

      <nav className="sticky bottom-0 border-gray-200 border-t bg-white">
        <div className="flex items-center justify-around py-3">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2"
            aria-label="Home"
          >
            <Home className="h-6 w-6 text-gray-900" fill="currentColor" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500"
            aria-label="Create"
          >
            <PlusSquare className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2"
            aria-label="Profile"
          >
            <Avatar
              src={avatarUrl}
              displayName={displayName}
              className="h-6 w-6 ring-2 ring-gray-900"
            />
          </button>
        </div>
      </nav>
    </section>
  );
}
