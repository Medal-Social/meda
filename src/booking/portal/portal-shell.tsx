'use client';

import { type ComponentType, type ReactNode, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { type SlotClassNames, slotClass } from '../slots.js';

export const PORTAL_SHELL_LABEL_KEYS = ['portalShell.nav', 'portalShell.navBar'] as const;
/**
 * `portalShell.nav` names the desktop rail, `portalShell.navBar` the phone's
 * bottom bar. Only one of the two is displayed at a time; a pack may give both
 * the same name.
 */
export type PortalShellLabels = Record<(typeof PORTAL_SHELL_LABEL_KEYS)[number], string>;

/** An icon the shell draws beside a tab label (e.g. a lucide icon). */
export type PortalShellIcon = ComponentType<{
  className?: string;
  'aria-hidden'?: boolean | 'true';
}>;

export interface PortalShellTab<Id extends string = string> {
  id: Id;
  /** The rail's label, and the section's accessible name. */
  label: string;
  /** The bottom bar's label, where there is less room. Defaults to `label`. */
  short?: string;
  icon?: PortalShellIcon;
  /** The bottom bar's icon. Defaults to `icon`. */
  shortIcon?: PortalShellIcon;
  /** The section's content. */
  content: ReactNode;
}

/**
 * - `root`: the whole shell.
 * - `rail`: the desktop sidebar; `railItem` / `railItemActive`: its buttons.
 * - `section`: every section.
 * - `bar`: the phone's bottom tab bar; `barItem` / `barItemActive`: its buttons.
 */
export type PortalShellSlot =
  | 'root'
  | 'rail'
  | 'railItem'
  | 'railItemActive'
  | 'section'
  | 'bar'
  | 'barItem'
  | 'barItemActive';

export interface PortalShellProps<Id extends string = string> {
  labels: PortalShellLabels;
  /** The sections, in order. */
  tabs: ReadonlyArray<PortalShellTab<Id>>;
  /** The open section (controlled). Pair with `onTabChange`. */
  tab?: Id;
  /** The open section when uncontrolled. Defaults to the first tab. */
  defaultTab?: Id;
  /** Called with the tab a user picked — e.g. to write it to the URL. */
  onTabChange?: (tab: Id) => void;
  /** The page header (greeting, «book» button). */
  header?: ReactNode;
  /** Who is logged in, drawn at the top of the rail. */
  account?: ReactNode;
  /**
   * The log-out control: last in the rail, and repeated under the
   * `logoutTab` section below `lg`, where there is no rail. Rendered twice,
   * so it should hold no state worth keeping.
   */
  logout?: ReactNode;
  /** The section that carries the logout on a phone. Defaults to the last tab. */
  logoutTab?: Id;
  classNames?: SlotClassNames<PortalShellSlot>;
}

/**
 * The portal's chrome: a sidebar on a desktop, a bottom tab bar on a phone,
 * and the sections both of them switch between — one piece of state read by
 * both, so rotating a tablet does not move the user.
 *
 * EVERY SECTION IS IN THE DOM, always, and only the current one is visible:
 * sections hold half-edited forms, and unmounting one on a stray tap would
 * throw that work away. `hidden` rather than a class, so an inactive section
 * is out of the accessibility tree and the tab order too.
 *
 * A `nav` with `aria-current`, not a `tablist`: two tablists driving one set
 * of panels is not a shape the pattern has, and these are page sections.
 */
export function PortalShell<Id extends string = string>({
  labels,
  tabs,
  tab: tabProp,
  defaultTab,
  onTabChange,
  header,
  account,
  logout,
  logoutTab,
  classNames,
}: PortalShellProps<Id>) {
  const [uncontrolled, setUncontrolled] = useState<Id | undefined>(defaultTab ?? tabs[0]?.id);
  const tab = tabProp ?? uncontrolled;
  const logoutIn = logoutTab ?? tabs[tabs.length - 1]?.id;

  function select(next: Id) {
    if (tabProp === undefined) setUncontrolled(next);
    onTabChange?.(next);
  }

  return (
    <div className={slotClass(classNames, 'root', 'space-y-8')}>
      {header}

      <div className="gap-10 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* Hidden on a phone, where the bar at the bottom is the same
            navigation within thumb's reach. */}
        <aside className={slotClass(classNames, 'rail', 'hidden lg:block')}>
          <div className="sticky top-8 space-y-4">
            {account}
            <nav aria-label={labels['portalShell.nav']}>
              <ul className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      aria-current={tab === id ? 'page' : undefined}
                      onClick={() => select(id)}
                      className={cn(
                        slotClass(
                          classNames,
                          'railItem',
                          'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors',
                          tab === id
                            ? 'bg-foreground text-background'
                            : 'text-foreground hover:bg-muted'
                        ),
                        tab === id && classNames?.railItemActive
                      )}
                    >
                      {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {logout}
          </div>
        </aside>

        {/* Padding at the bottom on a phone, so the last control on a section
            is not underneath the fixed tab bar. */}
        <div className="pb-28 lg:pb-0">
          {tabs.map(({ id, label, content }) => (
            <section
              key={id}
              hidden={tab !== id}
              aria-label={label}
              // `space-y` on the section rather than a wrapper, so a hidden one
              // contributes no margin.
              className={slotClass(classNames, 'section', 'space-y-10')}
            >
              {content}
              {id === logoutIn && logout && <div className="lg:hidden">{logout}</div>}
            </section>
          ))}
        </div>
      </div>

      <nav
        aria-label={labels['portalShell.navBar']}
        className={slotClass(
          classNames,
          'bar',
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden'
        )}
      >
        <ul className="mx-auto flex max-w-lg">
          {tabs.map(({ id, label, short, icon, shortIcon }) => {
            const ShortIcon = shortIcon ?? icon;
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => select(id)}
                  className={cn(
                    slotClass(
                      classNames,
                      'barItem',
                      'flex w-full flex-col items-center gap-1 px-2 py-3 text-[0.7rem] font-bold transition-colors',
                      tab === id ? 'text-primary' : 'text-muted-foreground'
                    ),
                    tab === id && classNames?.barItemActive
                  )}
                >
                  {ShortIcon && <ShortIcon aria-hidden="true" className="size-5" />}
                  {short ?? label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
