import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { ShellRailItem } from './types';

interface ShellAppRailRenderArgs {
  children: ReactNode;
  className: string;
  isActive: boolean;
  item: ShellRailItem;
}

export interface ShellAppRailProps {
  mainItems: ShellRailItem[];
  utilityItems: ShellRailItem[];
  className?: string;
  footer?: ReactNode;
  isItemActive: (item: ShellRailItem) => boolean;
  renderLink: (args: ShellAppRailRenderArgs) => ReactNode;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function RailDivider({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <div className="group flex w-full items-center justify-center py-4">
      <button
        type="button"
        aria-label={pinned ? 'Push items down' : 'Push items up'}
        onClick={onToggle}
        className="flex cursor-pointer flex-col items-center gap-0.5"
      >
        <span className="hidden h-3.5 w-6 items-center justify-center text-[var(--app-rail-foreground)] transition-colors group-hover:flex">
          {pinned ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
        <span className="block h-0.5 w-6 rounded-full bg-[var(--app-rail-foreground)]/30 transition-colors group-hover:bg-[var(--primary)]" />
      </button>
    </div>
  );
}

function RailSection({
  items,
  isItemActive,
  renderLink,
  ariaLabel,
  className,
}: {
  items: ShellRailItem[];
  isItemActive: (item: ShellRailItem) => boolean;
  renderLink: (args: ShellAppRailRenderArgs) => ReactNode;
  ariaLabel: string;
  className: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const isActive = isItemActive(item);
        const Icon = item.icon;

        return renderLink({
          item,
          isActive,
          className: joinClasses(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-center transition-colors',
            isActive
              ? 'bg-[var(--app-rail-item-active-bg)] text-[var(--foreground)]'
              : 'text-[var(--app-rail-foreground)] hover:bg-[var(--surface-highlight)] hover:text-[var(--foreground)]'
          ),
          children: (
            <>
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </>
          ),
        });
      })}
    </nav>
  );
}

export function ShellAppRail({
  mainItems,
  utilityItems,
  className,
  footer,
  isItemActive,
  renderLink,
}: ShellAppRailProps) {
  const [pinned, setPinned] = useState(false);

  return (
    <div
      className={joinClasses(
        'flex w-[var(--app-rail-width)] shrink-0 flex-col items-center bg-[var(--app-rail)] px-2 py-4',
        className
      )}
    >
      <RailSection
        items={mainItems}
        isItemActive={isItemActive}
        renderLink={renderLink}
        ariaLabel="Main navigation"
        className="flex flex-col items-center gap-1.5"
      />

      <div
        className={joinClasses(
          'transition-[flex-grow] duration-300 ease-in-out',
          pinned ? 'grow-0' : 'grow'
        )}
      />

      <RailDivider pinned={pinned} onToggle={() => setPinned(!pinned)} />

      <RailSection
        items={utilityItems}
        isItemActive={isItemActive}
        renderLink={renderLink}
        ariaLabel="Utility navigation"
        className="mb-2 flex flex-col items-center gap-1"
      />

      <div
        className={joinClasses(
          'transition-[flex-grow] duration-300 ease-in-out',
          pinned ? 'grow' : 'grow-0'
        )}
      />

      {footer}
    </div>
  );
}
