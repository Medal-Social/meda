'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
}

export interface IconRailProps {
  mainItems: IconRailItem[];
  utilityItems?: IconRailItem[];
  footer?: ReactNode;
  activeId?: string;
  renderLink?: (args: IconRailRenderLinkArgs) => ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Item styling
// ---------------------------------------------------------------------------

function itemClass(isActive: boolean) {
  return cn(
    'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
    isActive
      ? 'bg-primary/12 text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
        'my-3 flex h-6 w-8 items-center justify-center rounded-md',
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
  className,
}: IconRailProps) {
  const band = useShellViewport();
  const [pinnedBottom, setPinnedBottom] = useState(true);

  if (band === 'mobile') return null;

  const renderItem = (item: IconRailItem) => {
    const isActive = item.id === activeId;
    const klass = itemClass(isActive);
    const IconComp = item.icon;
    const inner = (
      <>
        <IconComp size={22} aria-hidden="true" />
        {item.badge ? <span className="absolute right-1 top-1">{item.badge}</span> : null}
      </>
    );

    // The trigger render element carries the item class (active/inactive styling)
    // AND the data-testid. This means tests can fire mouseEnter on it to open
    // the tooltip AND check its className for active state in one selector.
    const triggerRender = <span data-testid={`icon-rail-trigger-${item.id}`} className={klass} />;

    const linkContent = renderLink ? (
      // renderLink consumers receive the className so they can apply it themselves
      renderLink({ item, isActive, className: klass, children: inner })
    ) : (
      <a
        href={item.to}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        className="contents"
      >
        {inner}
      </a>
    );

    return (
      <Tooltip key={item.id}>
        {/* Trigger span owns the visual state; link inside provides navigation */}
        <TooltipTrigger render={triggerRender}>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <nav
        aria-label="Primary"
        className={cn(
          'flex h-full w-[var(--shell-rail-width)] shrink-0 flex-col items-center bg-shell-rail py-3.5',
          className
        )}
      >
        <div className="flex flex-col items-center gap-1">{mainItems.map(renderItem)}</div>
        {utilityItems.length > 0 && (
          <>
            <RailDivider
              pinnedBottom={pinnedBottom}
              onToggle={() => setPinnedBottom((prev) => !prev)}
            />
            <div
              data-testid="utility-items-wrapper"
              className={cn('flex flex-col items-center gap-1', pinnedBottom && 'mt-auto')}
            >
              {utilityItems.map(renderItem)}
            </div>
          </>
        )}
        {footer && (
          <div className={cn('pt-3', pinnedBottom || utilityItems.length === 0 ? 'mt-auto' : '')}>
            {footer}
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}
