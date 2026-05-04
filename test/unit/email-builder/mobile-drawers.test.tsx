import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileDrawer } from '../mobile-drawers.js';

describe('MobileDrawer', () => {
  it('renders the title when open', () => {
    render(
      <MobileDrawer open title="Block Palette" onOpenChange={() => {}}>
        <div>drawer content</div>
      </MobileDrawer>
    );
    expect(screen.getByText('Block Palette')).toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(
      <MobileDrawer open title="Inspector" onOpenChange={() => {}}>
        <div>inspector content</div>
      </MobileDrawer>
    );
    expect(screen.getByText('inspector content')).toBeInTheDocument();
  });

  it('does not render drawer content when closed', () => {
    render(
      <MobileDrawer open={false} title="Block Palette" onOpenChange={() => {}}>
        <div>hidden content</div>
      </MobileDrawer>
    );
    // When closed, the Drawer component should not mount content
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });
});
