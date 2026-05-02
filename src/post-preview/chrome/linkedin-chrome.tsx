import { Bell, Briefcase, Home, MessageSquare, Search, Users } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface LinkedInChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  displayName?: string;
  className?: string;
  ariaLabel?: string;
  searchLabel?: string;
  homeLabel?: string;
  myNetworkLabel?: string;
  jobsLabel?: string;
  messagingLabel?: string;
  notificationsLabel?: string;
  meLabel?: string;
}

/**
 * LinkedIn chrome: white top header with logo, search, and primary nav
 * icons. Wraps any preview as the page body inside a centered card.
 */
export function LinkedInChrome({
  children,
  avatarUrl,
  displayName = 'User',
  className,
  ariaLabel = 'LinkedIn preview',
  searchLabel = 'Search',
  homeLabel = 'Home',
  myNetworkLabel = 'My Network',
  jobsLabel = 'Jobs',
  messagingLabel = 'Messaging',
  notificationsLabel = 'Notifications',
  meLabel = 'Me',
}: LinkedInChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-gray-100', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1128px] items-center gap-2 px-4 py-2">
          <svg className="h-9 w-9 flex-shrink-0" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="4" fill="#0A66C2" />
            <path
              d="M12.6 28.5H8.1V14.1h4.5v14.4zM10.35 12.15c-1.45 0-2.62-1.2-2.62-2.65 0-1.45 1.17-2.62 2.62-2.62s2.62 1.17 2.62 2.62c0 1.45-1.17 2.65-2.62 2.65zM28.5 28.5h-4.48v-7c0-1.67-.03-3.82-2.33-3.82-2.33 0-2.69 1.82-2.69 3.7v7.12h-4.48V14.1h4.3v1.97h.06c.6-1.13 2.06-2.33 4.24-2.33 4.54 0 5.38 2.99 5.38 6.87v7.89z"
              fill="white"
            />
          </svg>

          <div className="max-w-[280px] flex-1">
            <div className="flex items-center gap-2 rounded bg-blue-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-600" aria-hidden="true" />
              <span className="text-gray-600 text-sm">{searchLabel}</span>
            </div>
          </div>

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            <NavItem icon={Home} label={homeLabel} active />
            <NavItem icon={Users} label={myNetworkLabel} />
            <NavItem icon={Briefcase} label={jobsLabel} />
            <NavItem icon={MessageSquare} label={messagingLabel} />
            <NavItem icon={Bell} label={notificationsLabel} />

            <button
              type="button"
              className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-900"
            >
              <Avatar src={avatarUrl} displayName={displayName} className="h-6 w-6" />
              <span className="flex items-center gap-0.5 text-[12px]">
                {meLabel}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[555px] px-2 py-4 @[420px]:px-3">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">{children}</div>
      </main>
    </section>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-11 flex-col items-center gap-0.5 px-2',
        active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[12px]">{label}</span>
    </button>
  );
}
