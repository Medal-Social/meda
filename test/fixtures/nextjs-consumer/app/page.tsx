// This is an App Router server component.
// It mounts <MedaShellProvider> + <AppShell> from @medalsocial/meda/shell.
// Both carry 'use client' directives in dist output; Next.js traces them and
// applies the boundary at the underlying component files (the barrel itself
// no longer carries the directive — see src/shell/index.ts comment for why).
//
// <ShellViewportHintProvider> is here on purpose: the SSR viewport hint is a
// React Context, which a server component cannot provide directly, so the
// package ships this client wrapper. Rendering it from this server component
// is what proves the hint is usable where request headers actually live.
//
// Two details this page has to get right to build at all, both independent of
// the viewport hint:
//   * `variant` is required on every AppShellProps union member;
//   * AppDefinition['icon'] takes a LucideIcon *or* a ReactNode, and a server
//     component has to pass the rendered node — handing the icon component
//     itself across the boundary trips "Functions cannot be passed directly to
//     Client Components".
import {
  AppShell,
  AppShellBody,
  MedaShellProvider,
  ShellViewportHintProvider,
} from '@medalsocial/meda/shell';
import { Inbox } from 'lucide-react';

export default function Page() {
  return (
    <ShellViewportHintProvider value="mobile">
      <MedaShellProvider
        workspace={{ id: 'ws-test', name: 'Test', icon: 'W' }}
        apps={[{ id: 'app-test', label: 'Test', icon: <Inbox /> }]}
      >
        <AppShell variant="workspace">
          <AppShellBody>
            <main>content</main>
          </AppShellBody>
        </AppShell>
      </MedaShellProvider>
    </ShellViewportHintProvider>
  );
}
