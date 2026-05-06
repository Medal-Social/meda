import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileTabBar } from '../../../src/email-builder/mobile-tab-bar.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';

const labels = defaultEmailBuilderLabels;

describe('MobileTabBar', () => {
  it('renders blocks, inspector, and settings buttons', () => {
    render(
      <MobileTabBar
        labels={labels}
        onOpenBlocks={() => {}}
        onOpenInspector={() => {}}
        onOpenSettings={() => {}}
      />
    );
    expect(screen.getByText(labels.openBlocks)).toBeInTheDocument();
    expect(screen.getByText(labels.openInspector)).toBeInTheDocument();
    expect(screen.getByText(labels.openSettings)).toBeInTheDocument();
  });

  it('calls onOpenBlocks when blocks button is clicked', () => {
    const onOpenBlocks = vi.fn();
    render(
      <MobileTabBar
        labels={labels}
        onOpenBlocks={onOpenBlocks}
        onOpenInspector={() => {}}
        onOpenSettings={() => {}}
      />
    );
    fireEvent.click(screen.getByText(labels.openBlocks).closest('button') as HTMLElement);
    expect(onOpenBlocks).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenInspector when inspector button is clicked', () => {
    const onOpenInspector = vi.fn();
    render(
      <MobileTabBar
        labels={labels}
        onOpenBlocks={() => {}}
        onOpenInspector={onOpenInspector}
        onOpenSettings={() => {}}
      />
    );
    fireEvent.click(screen.getByText(labels.openInspector).closest('button') as HTMLElement);
    expect(onOpenInspector).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when settings button is clicked', () => {
    const onOpenSettings = vi.fn();
    render(
      <MobileTabBar
        labels={labels}
        onOpenBlocks={() => {}}
        onOpenInspector={() => {}}
        onOpenSettings={onOpenSettings}
      />
    );
    fireEvent.click(screen.getByText(labels.openSettings).closest('button') as HTMLElement);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('has the correct data-slot attribute', () => {
    const { container } = render(
      <MobileTabBar
        labels={labels}
        onOpenBlocks={() => {}}
        onOpenInspector={() => {}}
        onOpenSettings={() => {}}
      />
    );
    expect(
      container.querySelector('[data-slot="email-builder-mobile-tab-bar"]')
    ).toBeInTheDocument();
  });
});
