'use client';

// Client shell wrapper — mirrors the package's own Next.js recipe
// (@medalsocial/meda/recipes/next): MedaShellProvider + AppShell live in a
// client module because shell wiring (apps with icon components, menu
// callbacks) is not serializable across the Server/Client Component boundary.
import { AppShell, AppShellBody, MedaShellProvider } from '@medalsocial/meda/shell';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function ConsumerShell({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider
      workspace={{ id: 'ws-test', name: 'Test', icon: 'W' }}
      apps={[{ id: 'app-test', label: 'Test', icon: Inbox }]}
    >
      <AppShell variant="workspace">
        <AppShellBody>{children}</AppShellBody>
      </AppShell>
    </MedaShellProvider>
  );
}
