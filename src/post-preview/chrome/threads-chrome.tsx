import { Edit, Heart, Home, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface ThreadsChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Threads chrome: minimal logo header + bottom tab bar. Honors `.dark`
 * for the platform's signature monochrome dark scheme.
 */
export function ThreadsChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'Threads preview',
}: ThreadsChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-white dark:bg-[#101010]', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white dark:border-gray-800 dark:bg-[#101010]">
        <div className="flex items-center justify-center px-4 py-3">
          <svg
            className="h-8 w-8 text-black dark:text-white"
            viewBox="0 0 192 192"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.68 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c23.003.173 40.48 7.54 51.914 21.896 5.638 7.08 9.761 15.818 12.349 26.14l17.088-4.547c-3.111-12.576-8.393-23.417-15.791-32.373-13.856-17.393-34.477-26.268-61.262-26.38h-.594c-26.746.112-47.227 8.94-60.87 26.24C27.293 43.723 21.094 66.354 20.86 95.753v.496c.234 29.399 6.433 52.03 18.999 67.836 13.643 17.3 34.124 26.128 60.87 26.24h.594c24.12-.163 42.003-6.9 56.351-21.249 18.688-18.688 18.06-42.166 11.39-57.714-4.791-11.177-13.454-20.124-25.342-26.213zm-65.749 58.86c-10.44.569-21.288-4.104-22.06-14.612-.573-7.799 5.542-16.474 25.375-17.619 2.22-.128 4.387-.192 6.503-.192 6.225 0 12.04.565 17.333 1.66-1.974 23.075-14.416 30.189-27.151 30.763z" />
          </svg>
        </div>
      </header>

      <main className="bg-white dark:bg-[#101010]">{children}</main>

      <nav className="sticky bottom-0 border-gray-200 border-t bg-white dark:border-gray-800 dark:bg-[#101010]">
        <div className="flex items-center justify-around py-4">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-black dark:text-white"
            aria-label="Home"
          >
            <Home className="h-6 w-6" fill="currentColor" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-black dark:hover:text-white"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-black dark:hover:text-white"
            aria-label="Create"
          >
            <Edit className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-black dark:hover:text-white"
            aria-label="Activity"
          >
            <Heart className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-black dark:hover:text-white"
            aria-label="Profile"
          >
            <Avatar src={avatarUrl} displayName={displayName} className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </section>
  );
}
