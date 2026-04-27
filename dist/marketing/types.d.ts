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
