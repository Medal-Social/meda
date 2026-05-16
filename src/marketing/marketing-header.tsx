'use client';

import { type ReactNode, useState } from 'react';
import { MarketingMegaMenu } from './marketing-mega-menu.js';
import { MarketingNavItem } from './marketing-nav-item.js';
import type { MarketingHeaderProps } from './types.js';
import { cx } from './utils.js';

const DEFAULT_SIGN_IN = '/sign-in';
const DEFAULT_SIGN_UP = '/sign-up';
const DEFAULT_APP = '/app';

function DefaultLoggedOut({ signInHref, signUpHref }: { signInHref: string; signUpHref: string }) {
  return (
    <>
      <a href={signInHref} className="text-sm text-foreground/80 hover:text-foreground">
        Sign in
      </a>
      <a
        href={signUpHref}
        className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Start free
      </a>
    </>
  );
}

function DefaultLoggedIn({ appHref }: { appHref: string }) {
  return (
    <a
      href={appHref}
      className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Open dashboard
    </a>
  );
}

export function MarketingHeader({
  logo,
  navItems = [],
  user,
  signInHref = DEFAULT_SIGN_IN,
  signUpHref = DEFAULT_SIGN_UP,
  appHref = DEFAULT_APP,
  rightSlot,
  toggles,
  renderLoggedOut,
  renderLoggedIn,
  className,
}: MarketingHeaderProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  let right: ReactNode;
  if (rightSlot !== undefined) {
    right = rightSlot;
  } else if (user) {
    right = renderLoggedIn ? (
      renderLoggedIn(user, { appHref })
    ) : (
      <DefaultLoggedIn appHref={appHref} />
    );
  } else {
    right = renderLoggedOut ? (
      renderLoggedOut({ signInHref, signUpHref })
    ) : (
      <DefaultLoggedOut signInHref={signInHref} signUpHref={signUpHref} />
    );
  }

  const activeItem = navItems.find((i) => i.id === openId);
  let activePanel: ReactNode;
  if (activeItem && 'panel' in activeItem && activeItem.panel) {
    activePanel = activeItem.panel;
  } else if (activeItem && 'features' in activeItem && activeItem.features) {
    activePanel = (
      <MarketingMegaMenu
        triggerId={activeItem.id}
        open
        onOpenChange={(next) => setOpenId(next ? activeItem.id : null)}
        features={activeItem.features}
      />
    );
  } else {
    activePanel = undefined;
  }

  return (
    <nav aria-label="Primary" className="relative" onMouseLeave={() => setOpenId(null)}>
      <div
        className={cx(
          'mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-border/60 bg-background/70 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/50',
          className
        )}
      >
        <div className="flex items-center gap-6">
          {logo}
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <MarketingNavItem
                  {...item}
                  open={openId === item.id}
                  onToggle={
                    item.hasMenu ? () => setOpenId(openId === item.id ? null : item.id) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          {toggles}
          {right}
        </div>
      </div>
      {activePanel}
    </nav>
  );
}
