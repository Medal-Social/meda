import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { portalShellLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import {
  PortalShell,
  type PortalShellProps,
  type PortalShellTab,
} from '../../../../src/booking/portal/portal-shell.js';

type Id = 'overview' | 'children' | 'history' | 'profile';

const TABS: PortalShellTab<Id>[] = [
  { id: 'overview', label: 'Oversikt', short: 'Hjem', content: <p>Neste timer</p> },
  { id: 'children', label: 'Barna', content: <input aria-label="Navn" defaultValue="" /> },
  { id: 'history', label: 'Historikk', content: <p>Historikk-innhold</p> },
  { id: 'profile', label: 'Profil', content: <p>Om deg</p> },
];

function renderShell(props: Partial<PortalShellProps<Id>> = {}) {
  return render(
    <PortalShell<Id>
      labels={labels}
      tabs={TABS}
      header={<h1>Hei, Demo!</h1>}
      account={<p>Demo Forelder</p>}
      logout={<button type="button">Logg ut</button>}
      {...props}
    />
  );
}

function sectionOf(text: string): HTMLElement {
  const node = screen.getByText(text).closest('section');
  if (node === null) throw new Error(`no section around ${text}`);
  return node;
}

describe('PortalShell', () => {
  it('opens on the first tab, with the other sections hidden', () => {
    renderShell();
    expect(sectionOf('Neste timer')).not.toHaveAttribute('hidden');
    expect(sectionOf('Historikk-innhold')).toHaveAttribute('hidden');
    expect(sectionOf('Om deg')).toHaveAttribute('hidden');
  });

  it('opens on `defaultTab` when given', () => {
    renderShell({ defaultTab: 'history' });
    expect(sectionOf('Historikk-innhold')).not.toHaveAttribute('hidden');
    expect(sectionOf('Neste timer')).toHaveAttribute('hidden');
  });

  it('offers every destination in both navigations, with the short label in the bar', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: labels['portalShell.nav'] })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: labels['portalShell.navBar'] })
    ).toBeInTheDocument();
    for (const label of ['Barna', 'Historikk', 'Profil']) {
      expect(screen.getAllByRole('button', { name: label })).toHaveLength(2);
    }
    expect(screen.getAllByRole('button', { name: 'Oversikt' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Hjem' })).toHaveLength(1);
  });

  it('switches sections from the rail', () => {
    renderShell();
    fireEvent.click(screen.getAllByRole('button', { name: 'Historikk' })[0]);
    expect(sectionOf('Historikk-innhold')).not.toHaveAttribute('hidden');
    expect(sectionOf('Neste timer')).toHaveAttribute('hidden');
  });

  it('switches sections from the phone tab bar, and says which one is current in both', () => {
    renderShell();
    fireEvent.click(screen.getAllByRole('button', { name: 'Profil' })[1]);

    expect(sectionOf('Om deg')).not.toHaveAttribute('hidden');
    for (const button of screen.getAllByRole('button', { name: 'Profil' })) {
      expect(button).toHaveAttribute('aria-current', 'page');
    }
    expect(screen.getByRole('button', { name: 'Oversikt' })).not.toHaveAttribute('aria-current');
  });

  it('keeps what was typed when the user looks at another section', () => {
    renderShell();
    fireEvent.change(screen.getByLabelText('Navn'), { target: { value: 'Mia' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Historikk' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Barna' })[0]);
    expect(screen.getByLabelText('Navn')).toHaveValue('Mia');
  });

  it('keeps the hidden sections out of reach, logout included', () => {
    renderShell();
    // Only the rail's logout is reachable; the copy at the foot of the last
    // section is inside a hidden section.
    expect(screen.getAllByRole('button', { name: 'Logg ut' })).toHaveLength(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Profil' })[0]);
    expect(screen.getAllByRole('button', { name: 'Logg ut' })).toHaveLength(2);
  });

  it('repeats the logout under `logoutTab` instead of the last tab', () => {
    renderShell({ logoutTab: 'overview' });
    expect(screen.getAllByRole('button', { name: 'Logg ut' })).toHaveLength(2);
  });

  it('names each section by its tab label', () => {
    renderShell();
    expect(screen.getByRole('region', { name: 'Oversikt' })).toBeInTheDocument();
  });

  describe('controlled', () => {
    it('reports a pick and follows `tab`', () => {
      const onTabChange = vi.fn();
      const { rerender } = renderShell({ tab: 'overview', onTabChange });

      fireEvent.click(screen.getAllByRole('button', { name: 'Barna' })[0]);
      expect(onTabChange).toHaveBeenCalledWith('children');
      // Controlled: nothing moves until the caller says so.
      expect(sectionOf('Neste timer')).not.toHaveAttribute('hidden');

      rerender(
        <PortalShell<Id> labels={labels} tabs={TABS} tab="children" onTabChange={onTabChange} />
      );
      expect(sectionOf('Neste timer')).toHaveAttribute('hidden');
    });

    it('works with a caller that keeps the tab in its own state (e.g. the URL)', () => {
      function Host() {
        const [tab, setTab] = useState<Id>('profile');
        return <PortalShell<Id> labels={labels} tabs={TABS} tab={tab} onTabChange={setTab} />;
      }
      render(<Host />);
      expect(sectionOf('Om deg')).not.toHaveAttribute('hidden');
      fireEvent.click(screen.getAllByRole('button', { name: 'Oversikt' })[0]);
      expect(sectionOf('Neste timer')).not.toHaveAttribute('hidden');
    });
  });

  describe('keyboard', () => {
    it('is native buttons in the tab order, in tab order, with nothing hidden in between', () => {
      renderShell();
      const rail = screen.getByRole('navigation', { name: labels['portalShell.nav'] });
      const buttons = Array.from(rail.querySelectorAll('button'));
      expect(buttons.map((button) => button.textContent)).toEqual([
        'Oversikt',
        'Barna',
        'Historikk',
        'Profil',
      ]);
      for (const button of buttons) {
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
        expect(button).not.toHaveAttribute('tabindex');
      }
      // The input in the hidden section is out of the tab order (`hidden`).
      expect(screen.getByLabelText('Navn').closest('[hidden]')).not.toBeNull();
    });

    it('activates the focused destination with the key a native button answers to', () => {
      renderShell();
      const history = screen.getAllByRole('button', { name: 'Historikk' })[0];
      history.focus();
      expect(history).toHaveFocus();
      // Enter / Space on a native button dispatch a click; jsdom does not
      // synthesise it, so the click is the keyboard's (real keys: the story).
      fireEvent.keyDown(history, { key: 'Enter' });
      fireEvent.click(history);
      expect(sectionOf('Historikk-innhold')).not.toHaveAttribute('hidden');
      // Focus stays on the destination the user chose.
      expect(history).toHaveFocus();
      expect(history).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('overrides', () => {
    it('lands classNames on their slots', () => {
      const { container } = renderShell({
        classNames: {
          root: 'x-root',
          rail: 'x-rail',
          railItem: 'x-rail-item',
          railItemActive: 'x-rail-active',
          bar: 'x-bar',
          barItemActive: 'x-bar-active',
          section: 'x-section',
        },
      });
      expect(container.firstElementChild).toHaveClass('x-root');
      expect(container.querySelector('aside')).toHaveClass('x-rail');
      const [overview] = screen.getAllByRole('button', { name: 'Oversikt' });
      expect(overview).toHaveClass('x-rail-item', 'x-rail-active');
      expect(screen.getAllByRole('button', { name: 'Barna' })[0]).not.toHaveClass('x-rail-active');
      expect(screen.getByRole('button', { name: 'Hjem' })).toHaveClass('x-bar-active');
      expect(container.querySelectorAll('section.x-section')).toHaveLength(4);
    });

    it('takes the nav name from labels, and draws tab icons', () => {
      const Icon = ({ className }: { className?: string }) => (
        <svg data-testid="icon" className={className} />
      );
      render(
        <PortalShell<Id>
          labels={{ 'portalShell.nav': 'Konto', 'portalShell.navBar': 'Konto' }}
          tabs={TABS.map((tab) => ({ ...tab, icon: Icon }))}
        />
      );
      expect(screen.getAllByRole('navigation', { name: 'Konto' })).toHaveLength(2);
      expect(screen.getAllByTestId('icon')).toHaveLength(8);
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderShell();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
