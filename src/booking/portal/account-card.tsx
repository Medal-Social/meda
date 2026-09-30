import type { SlotClassNames } from '../slots.js';
import { slotClass } from '../slots.js';
import type { PortalProfileDto } from '../types.js';

/**
 * - `root`: the card.
 * - `avatar`: the initial.
 * - `name`, `detail`: the two lines.
 */
export type AccountCardSlot = 'root' | 'avatar' | 'name' | 'detail';

export interface AccountCardProps {
  profile: Pick<PortalProfileDto, 'email' | 'firstName' | 'lastName' | 'phone'>;
  /** The sidebar's narrower card: name and number, no address. */
  compact?: boolean;
  classNames?: SlotClassNames<AccountCardSlot>;
}

/**
 * Who is logged in — the card at the top of the portal's sidebar, and again at
 * the top of the profile section. Presentational and server-renderable.
 *
 * The e-mail sits beside the number because it is what the login is bound to.
 * Not in the compact card, though: a sidebar is not wide enough for both, and
 * an address cut off half-way answers nothing while looking like it should.
 * The card has no copy of its own, so it takes no labels.
 */
export function AccountCard({ profile, compact = false, classNames }: AccountCardProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  const shown = name.length > 0 ? name : profile.email;

  return (
    <div
      className={slotClass(
        classNames,
        'root',
        'flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-4'
      )}
    >
      <span
        aria-hidden="true"
        className={slotClass(
          classNames,
          'avatar',
          'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-sans text-lg font-bold'
        )}
      >
        {shown.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className={slotClass(classNames, 'name', 'block truncate font-semibold')}>
          {shown}
        </span>
        <span
          className={slotClass(
            classNames,
            'detail',
            'block truncate text-sm text-muted-foreground'
          )}
        >
          {(compact ? [profile.phone ?? profile.email] : [profile.phone, profile.email])
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
    </div>
  );
}
