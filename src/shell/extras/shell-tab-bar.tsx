import type { ReactNode } from 'react';
import type { ShellTab } from '../types.js';

interface ShellTabBarRenderArgs {
  children: ReactNode;
  className: string;
  isActive: boolean;
  tab: ShellTab;
}

export interface ShellTabBarProps {
  tabs: ShellTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
  renderLink?: (args: ShellTabBarRenderArgs) => ReactNode;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

const tabBarClassName =
  'flex h-[var(--tab-bar-height)] shrink-0 items-center gap-3 overflow-x-auto bg-[var(--background)] px-3';
const tabClassName = 'border-b-[1.5px] pb-2.5 pt-2.5 text-xs whitespace-nowrap transition-colors';
const activeTabClassName = 'border-[var(--primary)] text-[var(--primary)]';
const inactiveTabClassName =
  'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]';

export function ShellTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
  ariaLabel = 'Tabs',
  renderLink,
}: ShellTabBarProps) {
  if (tabs.length === 0) return null;

  if (renderLink && tabs.every((tab) => Boolean(tab.to))) {
    return (
      <nav aria-label={ariaLabel} className={joinClasses(tabBarClassName, className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return renderLink({
            tab,
            isActive,
            className: joinClasses(
              tabClassName,
              isActive ? activeTabClassName : inactiveTabClassName
            ),
            children: tab.label,
          });
        })}
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={joinClasses(tabBarClassName, className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            data-active={isActive}
            onClick={() => onTabChange?.(tab.id)}
            className={joinClasses(
              tabClassName,
              isActive ? activeTabClassName : inactiveTabClassName
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
