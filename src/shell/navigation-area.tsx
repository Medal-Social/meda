import type { ReactNode } from 'react';

export function NavigationArea({ children }: { children: ReactNode }) {
  return <div className="relative hidden shrink-0 md:flex">{children}</div>;
}
