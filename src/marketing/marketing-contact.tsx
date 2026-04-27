'use client';

import { Clock, Mail, MapPin, Phone, Smartphone } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { MarketingContactPerson, MarketingContactProps, MarketingOffice } from './types.js';
import { cx, toTelHref } from './utils.js';

interface InfoRowProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: ReactNode;
  children: ReactNode;
}

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
        <div className="text-sm leading-6 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
      {title && <h3 className="mb-5 text-lg font-semibold text-foreground">{title}</h3>}
      {children}
    </section>
  );
}

function OfficeInfo({ office }: { office: MarketingOffice }) {
  return (
    <DetailCard title={office.title ?? 'Office'}>
      <div className="space-y-5">
        {office.address && (
          <InfoRow icon={MapPin} label="Address">
            {office.address}
          </InfoRow>
        )}
        {office.email && (
          <InfoRow icon={Mail} label="Email">
            <a className="hover:text-foreground" href={`mailto:${office.email}`}>
              {office.email}
            </a>
          </InfoRow>
        )}
        {office.phone && (
          <InfoRow icon={Phone} label="Phone">
            <a className="hover:text-foreground" href={toTelHref(office.phone)}>
              {office.phone}
            </a>
          </InfoRow>
        )}
        {office.hours && (
          <InfoRow icon={Clock} label="Opening hours">
            {office.hours}
          </InfoRow>
        )}
      </div>
    </DetailCard>
  );
}

function ContactPerson({ person }: { person: MarketingContactPerson }) {
  return (
    <DetailCard title={person.title ?? 'Direct contact'}>
      <div className="flex flex-col gap-5 sm:flex-row">
        {person.image && <div className="shrink-0 overflow-hidden rounded-lg">{person.image}</div>}
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold text-foreground">{person.name}</h4>
          {person.role && <p className="mt-1 text-sm font-semibold text-primary">{person.role}</p>}
          {person.description && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{person.description}</p>
          )}
          {(person.email || person.phone) && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {person.email && (
                <a
                  className="flex items-center gap-2 hover:text-foreground"
                  href={`mailto:${person.email}`}
                >
                  <Mail className="size-4" aria-hidden />
                  {person.email}
                </a>
              )}
              {person.phone && (
                <a
                  className="flex items-center gap-2 hover:text-foreground"
                  href={toTelHref(person.phone)}
                >
                  <Smartphone className="size-4" aria-hidden />
                  {person.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </DetailCard>
  );
}

export function MarketingContact({
  intro,
  form,
  office,
  contactPerson,
  compact = false,
  className,
}: MarketingContactProps) {
  return (
    <section className={cx('bg-background px-6 py-12 text-foreground sm:px-8', className)}>
      <div className="mx-auto max-w-6xl">
        {intro && (
          <div className={cx('mx-auto max-w-3xl text-center', compact ? 'mb-8' : 'mb-12')}>
            <div className="text-base leading-7 text-muted-foreground sm:text-lg">{intro}</div>
          </div>
        )}
        <div
          className={cx(
            'grid items-start gap-6',
            compact ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_420px]'
          )}
        >
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{form}</div>
          {(office || contactPerson) && (
            <div className="space-y-6">
              {office && <OfficeInfo office={office} />}
              {contactPerson && <ContactPerson person={contactPerson} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
