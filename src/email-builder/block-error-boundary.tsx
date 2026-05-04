'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  blockId: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Catches render errors inside an individual block so a broken block doesn't tear down the canvas. */
export class BlockErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(_error: Error): void {
    // No-op. Consumers can subclass or wrap to add custom logging — we don't
    // want to call console here (and trip the lint rule) in a public package.
  }

  override render(): ReactNode {
    /* v8 ignore next -- v8 counts an implicit undefined branch on null-initialised class field */
    if (this.state.error) {
      return (
        <div
          data-slot="email-builder-block-error"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm"
          role="alert"
        >
          Block failed to render: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
