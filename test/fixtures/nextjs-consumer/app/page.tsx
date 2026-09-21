// This is an App Router server component. It renders the client shell
// wrapper (app/shell.tsx), which mounts <MedaShellProvider> + <AppShell>
// from @medalsocial/meda/shell — matching the package's documented Next.js
// recipe (@medalsocial/meda/recipes/next): the client wrapper owns the
// non-serializable shell wiring, server pages pass children through the
// boundary. The meda components themselves carry 'use client' in dist
// output; Next.js traces them and applies the boundary at the underlying
// component files.
import { ConsumerShell } from './shell';

export default function Page() {
  return (
    <ConsumerShell>
      <main>content</main>
    </ConsumerShell>
  );
}
