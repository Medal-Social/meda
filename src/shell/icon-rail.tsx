'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Fragment, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip.js';
import { cn } from '../lib/utils.js';
import { useShellViewport } from './use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IconRailItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: ReactNode;
}

export interface IconRailRenderLinkArgs {
  item: IconRailItem;
  isActive: boolean;
  className: string;
  children: ReactNode;
  linkProps: AnchorHTMLAttributes<HTMLAnchorElement>;
}

export type IconRailLabelVisibility = 'tooltip' | 'visible';

export interface IconRailProps {
  mainItems: IconRailItem[];
  utilityItems?: IconRailItem[];
  footer?: ReactNode;
  activeId?: string;
  renderLink?: (args: IconRailRenderLinkArgs) => ReactNode;
  labelVisibility?: IconRailLabelVisibility;
  className?: string;
}

// ---------------------------------------------------------------------------
// Item styling
// ---------------------------------------------------------------------------

// Short-viewport scaling: below 850px viewport height items compact (smaller
// icon frame, tighter spacing, smaller label); below 700px labels hide so the
// rail degrades to icon-only. The rail additionally scrolls (see railClass) as
// the hard guarantee that every item stays reachable on any height.
function itemClass(isActive: boolean, labelVisibility: IconRailLabelVisibility) {
  if (labelVisibility === 'visible') {
    return cn(
      'group relative flex min-h-[4rem] w-full shrink-0 flex-col items-center justify-start gap-1 px-1 py-1 text-center transition-colors',
      '[@media(max-height:850px)]:min-h-[3.25rem] [@media(max-height:850px)]:gap-0.5',
      '[@media(max-height:700px)]:min-h-0',
      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    );
  }
  return cn(
    'group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
    '[@media(max-height:700px)]:h-9 [@media(max-height:700px)]:w-9',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/60'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  );
}

function iconFrameClass(isActive: boolean) {
  return cn(
    'relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
    '[@media(max-height:850px)]:h-9 [@media(max-height:850px)]:w-9',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/60'
      : 'group-hover:bg-accent group-hover:text-foreground'
  );
}

function railClass(labelVisibility: IconRailLabelVisibility, className?: string) {
  return cn(
    'flex h-full shrink-0 flex-col items-center bg-shell-rail',
    // Hard reachability guarantee on short viewports: the rail scrolls when the
    // compact tiers still can't fit every item. Scrollbar is hidden — wheel,
    // trackpad, and keyboard focus traversal still scroll the overflow.
    'min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    labelVisibility === 'visible'
      ? 'w-[var(--shell-rail-label-width)] px-2 py-4 [@media(max-height:850px)]:py-2'
      : 'w-[var(--shell-rail-width)] py-3.5 [@media(max-height:850px)]:py-2',
    className
  );
}

// ---------------------------------------------------------------------------
// RailDivider — Picasso pattern: chevron toggle that repositions utility items
// between top and bottom of the rail (spatial, not expansion-related).
// State is component-local (useState), NOT persisted via useShellLayoutState.
// ---------------------------------------------------------------------------

export interface RailDividerProps {
  pinnedBottom: boolean;
  onToggle: () => void;
}

export function RailDivider({ pinnedBottom, onToggle }: RailDividerProps) {
  return (
    <button
      type="button"
      data-testid="rail-divider"
      onClick={onToggle}
      aria-label={pinnedBottom ? 'Pull utility items up' : 'Push utility items down'}
      className={cn(
        'my-3 flex h-6 w-8 shrink-0 items-center justify-center rounded-md',
        '[@media(max-height:850px)]:my-1',
        'text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
      )}
    >
      {pinnedBottom ? (
        <ChevronUp size={14} aria-hidden="true" />
      ) : (
        <ChevronDown size={14} aria-hidden="true" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// IconRail
// ---------------------------------------------------------------------------

export function IconRail({
  mainItems,
  utilityItems = [],
  footer,
  activeId,
  renderLink,
  labelVisibility = 'tooltip',
  className,
}: IconRailProps) {
  const band = useShellViewport();
  const [pinnedBottom, setPinnedBottom] = useState(true);

  if (band === 'mobile') return null;

  const showLabels = labelVisibility === 'visible';

  const renderItem = (item: IconRailItem) => {
    const isActive = item.id === activeId;
    const klass = itemClass(isActive, labelVisibility);
    const IconComp = item.icon;
    const inner = showLabels ? (
      <>
        <span data-slot="icon-rail-icon-frame" className={iconFrameClass(isActive)}>
          <IconComp size={26} aria-hidden="true" className="[@media(max-height:850px)]:size-5" />
          {item.badge ? <span className="absolute right-1 top-1">{item.badge}</span> : null}
        </span>
        <span
          data-slot="icon-rail-label"
          className="max-w-full truncate text-[12px] leading-4 [@media(max-height:850px)]:text-[11px] [@media(max-height:700px)]:hidden"
        >
          {item.label}
        </span>
      </>
    ) : (
      <>
        <IconComp size={22} aria-hidden="true" className="[@media(max-height:700px)]:size-[18px]" />
        {item.badge ? <span className="absolute right-1 top-1">{item.badge}</span> : null}
      </>
    );

    const linkProps = {
      href: item.to,
      'aria-label': item.label,
      'aria-current': isActive ? 'page' : undefined,
      className: 'contents',
      children: inner,
    } satisfies AnchorHTMLAttributes<HTMLAnchorElement>;

    const linkContent = renderLink ? (
      // renderLink consumers receive the className so they can apply it themselves
      renderLink({ item, isActive, className: klass, children: inner, linkProps })
    ) : (
      <a {...linkProps} />
    );

    const trigger = (
      <span data-testid={`icon-rail-trigger-${item.id}`} className={klass}>
        {linkContent}
      </span>
    );

    if (showLabels) {
      return <Fragment key={item.id}>{trigger}</Fragment>;
    }

    return (
      <Tooltip key={item.id}>
        {/* Trigger span owns the visual state; link inside provides navigation. */}
        <TooltipTrigger render={trigger} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <nav
        data-testid="icon-rail"
        aria-label="Primary"
        className={railClass(labelVisibility, className)}
      >
        <div
          className={cn(
            'flex shrink-0 flex-col items-center',
            showLabels ? 'w-full gap-1' : 'gap-1'
          )}
        >
          {mainItems.map(renderItem)}
        </div>
        {utilityItems.length > 0 && (
          <>
            <RailDivider
              pinnedBottom={pinnedBottom}
              onToggle={() => setPinnedBottom((prev) => !prev)}
            />
            <div
              data-testid="utility-items-wrapper"
              className={cn(
                'flex shrink-0 flex-col items-center',
                showLabels ? 'w-full gap-1' : 'gap-1',
                pinnedBottom && 'mt-auto'
              )}
            >
              {utilityItems.map(renderItem)}
            </div>
          </>
        )}
        {footer && (
          <div
            className={cn(
              'shrink-0 pt-3 [@media(max-height:850px)]:pt-1.5',
              pinnedBottom || utilityItems.length === 0 ? 'mt-auto' : ''
            )}
          >
            {footer}
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}
