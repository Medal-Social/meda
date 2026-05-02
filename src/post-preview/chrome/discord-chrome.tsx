import { Bell, Hash, HelpCircle, Inbox, Pin, Search, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface DiscordChromeProps {
  children: ReactNode;
  serverIconUrl?: string;
  serverName?: string;
  channelName?: string;
  className?: string;
  ariaLabel?: string;
  textChannelsLabel?: string;
  searchLabel?: string;
  usernameLabel?: string;
  onlineLabel?: string;
  messageChannelLabel?: (channel: string) => string;
}

/**
 * Discord chrome: server sidebar + channel sidebar + main content + input.
 * Light-themed, brand-accurate. Wraps any preview as the messages area.
 */
export function DiscordChrome({
  children,
  serverIconUrl,
  serverName = 'Server',
  channelName = 'general',
  className,
  ariaLabel = 'Discord preview',
  textChannelsLabel = 'TEXT CHANNELS',
  searchLabel = 'Search',
  usernameLabel = 'username',
  onlineLabel = 'Online',
  messageChannelLabel = (channel) => `Message #${channel}`,
}: DiscordChromeProps) {
  return (
    <section
      className={cn('flex min-h-[400px] overflow-hidden bg-white', className)}
      aria-label={ariaLabel}
    >
      <div className="flex w-[72px] flex-col items-center gap-2 bg-[#E3E5E8] py-3">
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865F2] text-white"
          aria-label="Home"
        >
          <svg className="h-7 w-7" viewBox="0 0 28 20" fill="currentColor" aria-hidden="true">
            <path d="M23.021 1.677A21.227 21.227 0 0 0 17.658 0c-.252.462-.483.935-.687 1.418a19.931 19.931 0 0 0-5.943 0A14.09 14.09 0 0 0 10.342 0C8.509.286 6.74.757 5.067 1.677.727 8.294-.446 14.74.141 21.099a21.39 21.39 0 0 0 6.527 3.3 15.216 15.216 0 0 0 1.382-2.249 13.726 13.726 0 0 1-2.177-1.046c.182-.133.36-.273.532-.415a15.368 15.368 0 0 0 13.191 0c.173.148.351.288.532.415-.695.412-1.424.764-2.18 1.049.39.799.838 1.55 1.385 2.25a21.333 21.333 0 0 0 6.53-3.3c.693-7.227-.978-13.61-5.842-19.422ZM9.35 17.273c-1.818 0-3.317-1.667-3.317-3.704s1.459-3.714 3.317-3.714c1.858 0 3.357 1.667 3.317 3.714 0 2.037-1.469 3.704-3.317 3.704Zm9.3 0c-1.818 0-3.317-1.667-3.317-3.704s1.46-3.714 3.317-3.714c1.858 0 3.357 1.667 3.317 3.714 0 2.037-1.459 3.704-3.317 3.704Z" />
          </svg>
        </button>

        <div className="h-0.5 w-8 rounded-full bg-[#C7C8CE]" />

        <button
          type="button"
          className="h-12 w-12 overflow-hidden rounded-[24px]"
          aria-label={serverName}
        >
          {serverIconUrl ? (
            <img src={serverIconUrl} alt={serverName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#5865F2] font-semibold text-white">
              {serverName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>

      <div className="flex w-60 flex-col bg-[#F2F3F5]">
        <div className="flex h-12 items-center justify-between border-[#E1E2E4] border-b px-4 shadow-sm">
          <h1 className="truncate font-semibold text-[#060607]">{serverName}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="mb-1 px-1 font-semibold text-[#5C5E66] text-xs">{textChannelsLabel}</p>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded bg-[#D8D9DC] px-2 py-1.5 text-[#060607]"
          >
            <Hash className="h-5 w-5 text-[#5C5E66]" aria-hidden="true" />
            <span className="truncate">{channelName}</span>
          </button>
        </div>

        <div className="flex h-[52px] items-center gap-2 bg-[#EBEDEF] px-2">
          <Avatar src={undefined} displayName={usernameLabel} className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-[#060607] text-sm">{usernameLabel}</p>
            <p className="text-[#5C5E66] text-[11px]">{onlineLabel}</p>
          </div>
          <button
            type="button"
            className="p-1 text-[#5C5E66] hover:text-[#313338]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-white">
        <header className="flex h-12 items-center justify-between border-[#E1E2E4] border-b px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-6 w-6 text-[#747681]" aria-hidden="true" />
            <span className="font-semibold text-[#060607]">{channelName}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-[#747681] hover:text-[#313338]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-[#747681] hover:text-[#313338]"
              aria-label="Pinned"
            >
              <Pin className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-[#747681] hover:text-[#313338]"
              aria-label="Members"
            >
              <Users className="h-5 w-5" />
            </button>
            <div className="flex items-center rounded bg-[#E3E5E8] px-2">
              <input
                type="text"
                placeholder={searchLabel}
                aria-label={searchLabel}
                readOnly
                className="w-32 bg-transparent py-1 text-[#313338] text-sm placeholder-[#747681] outline-none"
              />
              <Search className="h-4 w-4 text-[#747681]" aria-hidden="true" />
            </div>
            <button
              type="button"
              className="text-[#747681] hover:text-[#313338]"
              aria-label="Inbox"
            >
              <Inbox className="h-5 w-5" />
            </button>
            <button type="button" className="text-[#747681] hover:text-[#313338]" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">{children}</main>

        <div className="px-4 pb-6 @[420px]:pb-8">
          <div className="flex items-center rounded-lg bg-[#EBEDEF] px-4 py-2.5">
            <span className="flex-1 text-[#747681]">{messageChannelLabel(channelName)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
