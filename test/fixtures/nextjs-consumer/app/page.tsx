// This is an App Router server component.
// It imports ShellFrame from @medalsocial/meda/shell — which must carry
// 'use client' in its dist output or Next.js will error on hook usage inside it.
import { ShellFrame } from '@medalsocial/meda/shell';

export default function Page() {
  return (
    <ShellFrame
      header={<div>header</div>}
      navigation={<nav>nav</nav>}
      content={<main>content</main>}
    />
  );
}
