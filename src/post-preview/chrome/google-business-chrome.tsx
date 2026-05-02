import { Building2, Camera, MapPin, Menu, MessageSquare, Search, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';

export interface GoogleBusinessChromeProps {
  children: ReactNode;
  avatarUrl?: string;
  businessName?: string;
  className?: string;
  ariaLabel?: string;
  reviewsLabel?: string;
  addressLabel?: string;
  messageLabel?: string;
  directionsLabel?: string;
  overviewLabel?: string;
  updatesLabel?: string;
  reviewsTabLabel?: string;
  photosLabel?: string;
}

/**
 * Google Business Profile chrome: Google search bar + business profile card +
 * tabs (Overview / Updates / Reviews / Photos). Wraps an update preview as
 * the active "Updates" tab content.
 */
export function GoogleBusinessChrome({
  children,
  avatarUrl,
  businessName = 'Your Business',
  className,
  ariaLabel = 'Google Business Profile preview',
  reviewsLabel = '4.8 (123 reviews)',
  addressLabel = '123 Business St, City, State',
  messageLabel = 'Message',
  directionsLabel = 'Directions',
  overviewLabel = 'Overview',
  updatesLabel = 'Updates',
  reviewsTabLabel = 'Reviews',
  photosLabel = 'Photos',
}: GoogleBusinessChromeProps) {
  return (
    <section
      className={cn('min-h-[400px] overflow-hidden bg-white', className)}
      aria-label={ariaLabel}
    >
      <header className="sticky top-0 z-20 border-gray-200 border-b bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <svg className="h-6 w-20" viewBox="0 0 74 24" fill="none" aria-hidden="true">
            <path
              d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z"
              fill="#4285F4"
            />
            <path
              d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81z"
              fill="#EA4335"
            />
          </svg>

          <div className="mx-4 max-w-md flex-1">
            <div className="flex items-center rounded-full border border-gray-200 bg-gray-100 px-4 py-2">
              <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="ml-3 text-gray-500 text-sm">{businessName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <Avatar src={avatarUrl} displayName={businessName} className="h-8 w-8" />
          </div>
        </div>
      </header>

      <div className="border-gray-200 border-b bg-white p-4">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <Avatar src={avatarUrl} displayName={businessName} className="h-16 w-16 rounded-lg" />
          ) : (
            <span
              role="img"
              aria-label={businessName}
              className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#4285F4] text-white"
            >
              <Building2 className="h-8 w-8" />
            </span>
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 text-xl">{businessName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <span className="text-gray-600 text-sm">{reviewsLabel}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-gray-600 text-sm">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{addressLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-4 py-2 font-medium text-sm text-white hover:bg-[#1557B0]"
          >
            <MessageSquare className="h-4 w-4" />
            {messageLabel}
          </button>
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2 font-medium text-[#1A73E8] text-sm hover:bg-gray-50"
          >
            <MapPin className="h-4 w-4" />
            {directionsLabel}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gray-300 p-2 hover:bg-gray-50"
            aria-label="Photos"
          >
            <Camera className="h-4 w-4 text-[#1A73E8]" />
          </button>
        </div>
      </div>

      <div className="border-gray-200 border-b bg-white">
        <div className="flex items-center gap-6 px-4">
          <button
            type="button"
            className="py-3 font-medium text-gray-500 text-sm hover:text-gray-900"
          >
            {overviewLabel}
          </button>
          <button
            type="button"
            className="border-[#1A73E8] border-b-2 py-3 font-medium text-[#1A73E8] text-sm"
          >
            {updatesLabel}
          </button>
          <button
            type="button"
            className="py-3 font-medium text-gray-500 text-sm hover:text-gray-900"
          >
            {reviewsTabLabel}
          </button>
          <button
            type="button"
            className="py-3 font-medium text-gray-500 text-sm hover:text-gray-900"
          >
            {photosLabel}
          </button>
        </div>
      </div>

      <main className="bg-gray-50 p-4">{children}</main>
    </section>
  );
}
