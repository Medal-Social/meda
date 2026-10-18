import type { Meta, StoryObj } from '@storybook/react-vite';
import { House, LayoutDashboard, ReceiptText, UserRound, Users } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { DEMO_NOW, DEMO_PHONE, demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import {
  demoKids,
  demoPast,
  demoProfile,
  demoRebook,
  demoRebookHref,
  demoStylistNames,
  demoUpcoming,
} from '../__stories__/fixtures.portal.js';
import { portalLabelsEn, portalLabelsNb } from '../__stories__/labels.portal.js';
import { bookingStoryParameters, SecondBrand } from '../__stories__/story-helpers.js';
import { bookingButtonClass } from '../internal/ui.js';
import { AccountCard } from './account-card.js';
import { ChildCards } from './child-cards.js';
import { PortalShell, type PortalShellTab } from './portal-shell.js';
import { RebookCards } from './rebook-cards.js';
import { UpcomingBookings } from './upcoming-bookings.js';
import { VisitHistory } from './visit-history.js';

type Id = 'overview' | 'children' | 'history' | 'profile';

/** The second brand's mid-luminance primary takes the hero contrast overrides. */
const SECOND_BRAND_HERO = { badge: 'bg-transparent px-0', heroMuted: 'text-primary-foreground' };

function Dashboard({
  english = false,
  secondBrand = false,
}: {
  english?: boolean;
  secondBrand?: boolean;
}) {
  const labels = english ? portalLabelsEn : portalLabelsNb;
  const format = english ? demoFormatEn : demoFormatNb;
  const names = english
    ? {
        overview: 'Overview',
        home: 'Home',
        children: 'Children',
        history: 'History',
        profile: 'Profile',
      }
    : {
        overview: 'Oversikt',
        home: 'Hjem',
        children: 'Barna',
        history: 'Historikk',
        profile: 'Profil',
      };
  const kidHref = (kid: (typeof demoKids)[number]) =>
    demoRebookHref({
      serviceId: kid.serviceId,
      resourceId: kid.preferredResourceId ?? kid.resourceId,
    });
  const tabs: PortalShellTab<Id>[] = [
    {
      id: 'overview',
      label: names.overview,
      short: names.home,
      icon: LayoutDashboard,
      shortIcon: House,
      content: (
        <>
          <UpcomingBookings
            bookings={demoUpcoming}
            phone={DEMO_PHONE}
            labels={labels}
            format={format}
            bookingHref="/book"
            now={DEMO_NOW}
            classNames={secondBrand ? SECOND_BRAND_HERO : undefined}
          />
          <ChildCards
            kids={demoKids}
            variant="compact"
            hrefFor={kidHref}
            labels={labels}
            format={format}
          />
          <RebookCards suggestions={demoRebook} hrefFor={demoRebookHref} labels={labels} />
        </>
      ),
    },
    {
      id: 'children',
      label: names.children,
      icon: Users,
      content: (
        <ChildCards
          kids={demoKids}
          hrefFor={kidHref}
          stylistNames={demoStylistNames}
          labels={labels}
          format={format}
        />
      ),
    },
    {
      id: 'history',
      label: names.history,
      icon: ReceiptText,
      content: <VisitHistory past={demoPast} labels={labels} format={format} />,
    },
    {
      id: 'profile',
      label: names.profile,
      icon: UserRound,
      content: <AccountCard profile={demoProfile} />,
    },
  ];
  return (
    <PortalShell<Id>
      labels={labels}
      tabs={tabs}
      header={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-sans text-2xl font-bold md:text-3xl">
            {english ? 'Hi, Demo!' : 'Hei, Demo!'}
          </h1>
          <a href="/book" className={bookingButtonClass()}>
            {english ? 'Book' : 'Bestill'}
          </a>
        </div>
      }
      account={<AccountCard profile={demoProfile} compact />}
      logout={
        <button type="button" className={bookingButtonClass({ variant: 'outline' })}>
          {english ? 'Log out' : 'Logg ut'}
        </button>
      }
    />
  );
}

const meta: Meta<typeof Dashboard> = {
  title: 'Booking/PortalShell',
  component: Dashboard,
  parameters: bookingStoryParameters,
};
export default meta;

type Story = StoryObj<typeof Dashboard>;

export const Default: Story = {};

/** English. Real keys: Tab reaches a destination, Enter opens it, Space opens another. */
export const English: Story = {
  args: { english: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Whichever navigation this viewport shows (role queries skip `display: none`).
    const [history] = canvas.getAllByRole('button', { name: 'History' });
    history.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('region', { name: 'History' })).toBeVisible();
    await expect(history).toHaveAttribute('aria-current', 'page');
    await userEvent.tab();
    const profile = canvas.getAllByRole('button', { name: 'Profile' })[0];
    await expect(profile).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('region', { name: 'Profile' })).toBeVisible();
    // Back to the overview for the snapshot.
    canvas.getAllByRole('button', { name: /^(Overview|Home)$/ })[0].click();
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: () => (
    <SecondBrand>
      <Dashboard secondBrand />
    </SecondBrand>
  ),
};
