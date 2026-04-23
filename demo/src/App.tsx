import { useState } from 'react';
import { ShellStateProvider, ShellFrame } from '@medalsocial/meda';

export function App() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());

  return (
    <ShellStateProvider
      adapter={{
        searchParams,
        setSearchParams: (updater) => setSearchParams((current) => updater(current)),
      }}
    >
      <ShellFrame
        header={<div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>Header</div>}
        navigation={<nav style={{ width: 200, borderRight: '1px solid #e5e7eb' }}>Navigation</nav>}
        content={
          <main style={{ padding: 24 }}>
            <h1>Meda demo</h1>
            <p>If you can read this, the shell rendered.</p>
          </main>
        }
      />
    </ShellStateProvider>
  );
}
