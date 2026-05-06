import type { MouseEventHandler, ReactNode } from 'react';

export type MarketingCtaVariant = 'primary' | 'secondary';
export type MarketingAlign = 'start' | 'center';

export interface MarketingCta {
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: MarketingCtaVariant;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

export interface MarketingCtaListProps {
  ctas?: MarketingCta[];
  align?: MarketingAlign;
  className?: string;
}

export type MarketingCalloutVariant = 'band' | 'card';

export interface MarketingCalloutProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  ctas?: MarketingCta[];
  variant?: MarketingCalloutVariant;
  align?: MarketingAlign;
  className?: string;
}

export interface MarketingOffice {
  title?: ReactNode;
  address?: ReactNode;
  email?: string;
  phone?: string;
  hours?: ReactNode;
}

export interface MarketingContactPerson {
  title?: ReactNode;
  name: ReactNode;
  role?: ReactNode;
  description?: ReactNode;
  image?: ReactNode;
  email?: string;
  phone?: string;
}

export interface MarketingContactProps {
  intro?: ReactNode;
  form: ReactNode;
  office?: MarketingOffice;
  contactPerson?: MarketingContactPerson;
  compact?: boolean;
  className?: string;
}

export type MarketingLeadMagnetVariant = 'featured' | 'sidebar';

export interface MarketingLeadMagnetProps {
  title: ReactNode;
  description?: ReactNode;
  benefits?: ReactNode[];
  image?: ReactNode;
  buttonText?: ReactNode;
  formTitle?: ReactNode;
  form?: ReactNode;
  variant?: MarketingLeadMagnetVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// ---- v1.8 — Landing v5 shell types ---- //

export interface MarketingHeaderUser {
  name: string;
  email?: string;
  image?: string;
  workspaceSlug?: string;
}

interface MarketingNavItemBase {
  id: string;
  label: ReactNode;
}

export interface MarketingNavLinkItem extends MarketingNavItemBase {
  href: string;
  hasMenu?: false;
  panel?: never;
}

export interface MarketingNavMenuItem extends MarketingNavItemBase {
  hasMenu: true;
  href?: string;
  panel?: ReactNode;
}

export type MarketingNavItemDescriptor = MarketingNavLinkItem | MarketingNavMenuItem;

export interface MarketingHeaderProps {
  logo?: ReactNode;
  navItems?: MarketingNavItemDescriptor[];
  user?: MarketingHeaderUser | null;
  signInHref?: string;
  signUpHref?: string;
  appHref?: string;
  rightSlot?: ReactNode;
  toggles?: ReactNode;
  renderLoggedOut?: (defaults: { signInHref: string; signUpHref: string }) => ReactNode;
  renderLoggedIn?: (user: MarketingHeaderUser, defaults: { appHref: string }) => ReactNode;
  className?: string;
}

export interface MarketingShellProps {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface MarketingFooterColumn {
  title: ReactNode;
  links: Array<{ label: ReactNode; href: string }>;
}

export interface MarketingFooterProps {
  brand?: ReactNode;
  tagline?: ReactNode;
  columns?: MarketingFooterColumn[];
  bottomSlot?: ReactNode;
  className?: string;
}

export interface MarketingTrustStat {
  value: ReactNode;
  label: ReactNode;
  caption?: ReactNode;
}

export interface MarketingTrustBarProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  stats: MarketingTrustStat[];
  className?: string;
}

export interface MarketingBentoGridProps {
  cols?: 2 | 3 | 4 | 6 | 12;
  children?: ReactNode;
  className?: string;
}

export interface MarketingBentoCardProps {
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  rowSpan?: 1 | 2 | 3;
  variant?: 'default' | 'feature' | 'compact';
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  href?: string;
  className?: string;
}

export interface MarketingFAQItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface MarketingFAQProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  items: MarketingFAQItem[];
  defaultOpenId?: string;
  className?: string;
}

// ---- v1.9 — Landing v5 enrichment types ---- //

export interface MarketingMegaMenuFeature {
  id: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
}

export interface MarketingMegaMenuProps {
  triggerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features?: MarketingMegaMenuFeature[];
  children?: ReactNode;
  className?: string;
}

export interface MarketingAnnouncementBarProps {
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface MarketingHeroProps {
  eyebrow?: ReactNode;
  headline: ReactNode;
  subtitle?: ReactNode;
  ctas?: ReactNode;
  meta?: ReactNode;
  productMockup?: ReactNode;
  className?: string;
}

export interface MarketingNumberedFeature {
  id: string;
  index: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

export interface MarketingNumberedFeaturesProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  features: MarketingNumberedFeature[];
  className?: string;
}

export interface MarketingCTAProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  ctas?: ReactNode;
  className?: string;
}
