// This is an App Router server component.
// It mounts <MedaShellProvider> + <AppShell> from @medalsocial/meda/shell.
// Both carry 'use client' directives in dist output; Next.js traces them and
// applies the boundary at the underlying component files (the barrel itself
// no longer carries the directive — see src/shell/index.ts comment for why).
import { AppShell, AppShellBody, MedaShellProvider } from '@medalsocial/meda/shell';
import { Inbox } from 'lucide-react';

export default function Page() {
  return (
    <MedaShellProvider
      workspace={{ id: 'ws-test', name: 'Test', icon: 'W' }}
      apps={[{ id: 'app-test', label: 'Test', icon: Inbox }]}
    >
      <AppShell>
        <AppShellBody>
          <main>content</main>
        </AppShellBody>
      </AppShell>
    </MedaShellProvider>
  );
}
