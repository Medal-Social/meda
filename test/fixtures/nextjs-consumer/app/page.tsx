// This is an App Router server component.
// It imports AppShell from @medalsocial/meda/shell — which must carry
// 'use client' in its dist output or Next.js will error on hook usage inside it.
import { AppShell, AppShellBody } from '@medalsocial/meda/shell';

export default function Page() {
  return (
    <AppShell>
      <AppShellBody>
        <main>content</main>
      </AppShellBody>
    </AppShell>
  );
}
