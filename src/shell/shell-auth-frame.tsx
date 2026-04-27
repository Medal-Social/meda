'use client';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, CheckCircle2, Mail, Moon, Send, Sparkles, Sun, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

export type ShellAuthTheme = 'light' | 'dark';

export interface ShellAuthFrameProps {
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  brandName?: ReactNode;
  brandMark?: ReactNode;
  eyebrow?: ReactNode;
  preview?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export interface ShellAuthThemeToggleProps {
  value: ShellAuthTheme;
  onValueChange: (value: ShellAuthTheme) => void;
  className?: string;
  lightLabel?: string;
  darkLabel?: string;
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function DefaultBrandMark() {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-white/14 text-white ring-1 ring-white/20 shadow-lg shadow-black/20">
      <Sparkles className="size-5" aria-hidden />
    </span>
  );
}

export function ShellAuthFrame({
  children,
  title,
  description,
  brandName = 'Meda',
  brandMark,
  eyebrow,
  preview,
  actions,
  className,
}: ShellAuthFrameProps) {
  const resolvedBrandMark = brandMark ?? <DefaultBrandMark />;

  return (
    <section
      data-testid="shell-auth-frame"
      className={cx(
        'grid min-h-screen overflow-hidden bg-background text-foreground lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]',
        className
      )}
    >
      <div className="relative flex min-h-[24rem] flex-col overflow-hidden bg-[radial-gradient(circle_at_24%_18%,var(--color-accent-cyan)_0,transparent_25%),radial-gradient(circle_at_84%_24%,var(--color-accent-magenta)_0,transparent_28%),linear-gradient(135deg,var(--color-brand-800),var(--color-brand-700)_42%,var(--color-brand-500))] px-6 py-6 text-white sm:min-h-[30rem] sm:px-8 lg:min-h-screen lg:px-10 lg:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          {resolvedBrandMark}
          <span className="text-lg font-semibold tracking-tight">{brandName}</span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 py-10 lg:py-12">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                {eyebrow}
              </p>
            )}
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                {description}
              </p>
            )}
          </div>
          <div className="w-full max-w-3xl">{preview ?? <DefaultAuthPreview />}</div>
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col bg-background px-6 py-6 sm:px-8 lg:px-12">
        {actions && <div className="flex justify-end">{actions}</div>}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 flex justify-center lg:hidden">{resolvedBrandMark}</div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function ShellAuthThemeToggle({
  value,
  onValueChange,
  className,
  lightLabel = 'Light theme',
  darkLabel = 'Dark theme',
}: ShellAuthThemeToggleProps) {
  return (
    <fieldset
      className={cx(
        'inline-flex items-center gap-1 rounded-md border border-border bg-card p-1 text-card-foreground shadow-sm',
        className
      )}
    >
      <legend className="sr-only">Theme</legend>
      <button
        type="button"
        aria-label={lightLabel}
        aria-pressed={value === 'light'}
        title={lightLabel}
        onClick={() => onValueChange('light')}
        className={themeButtonClass(value === 'light')}
      >
        <Sun className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={darkLabel}
        aria-pressed={value === 'dark'}
        title={darkLabel}
        onClick={() => onValueChange('dark')}
        className={themeButtonClass(value === 'dark')}
      >
        <Moon className="size-4" aria-hidden />
      </button>
    </fieldset>
  );
}

function themeButtonClass(active: boolean) {
  return cx(
    'inline-flex size-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );
}

function DefaultAuthPreview() {
  return (
    <div
      data-testid="shell-auth-default-preview"
      className="relative overflow-hidden rounded-xl border border-white/16 bg-white text-slate-950 shadow-2xl shadow-black/30"
      aria-hidden
    >
      <div className="flex h-9 items-center gap-1.5 border-slate-200 border-b bg-slate-50 px-3">
        <span className="size-2 rounded-full bg-rose-400" />
        <span className="size-2 rounded-full bg-amber-400" />
        <span className="size-2 rounded-full bg-emerald-400" />
      </div>
      <div className="grid min-h-[21rem] grid-cols-[132px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-1 border-slate-200 border-r bg-slate-50 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-[var(--color-brand-600)] text-white">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold leading-none">Workspace</p>
              <p className="mt-1 text-[8px] text-slate-500">Business plan</p>
            </div>
          </div>
          <PreviewNavItem icon={BarChart3} label="Home" active />
          <PreviewNavItem icon={Mail} label="Inbox" badge="4" />
          <PreviewNavItem icon={Send} label="Posts" />
          <PreviewNavItem icon={UsersRound} label="Contacts" />
          <div className="mt-auto rounded-md bg-white p-2 text-[9px] leading-4 text-slate-500 shadow-sm ring-1 ring-slate-200">
            <p className="font-medium text-slate-700">Next sync</p>
            <p>12 campaigns</p>
          </div>
        </aside>
        <main className="min-w-0 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Good morning</p>
              <p className="mt-1 text-[11px] text-slate-500">Launch queue and customer activity</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
              Live
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {PREVIEW_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-[9px] font-medium text-slate-500">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold">Activity</p>
              <p className="text-[9px] text-slate-500">Updated now</p>
            </div>
            <div className="space-y-2">
              {PREVIEW_ACTIVITY.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                    <CheckCircle2 className="size-3" aria-hidden />
                  </span>
                  <p className="truncate text-[10px] text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PreviewNavItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={cx(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px]',
        active ? 'bg-white font-semibold text-slate-950 shadow-sm' : 'text-slate-500'
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-[var(--color-brand-100)] px-1.5 text-[8px] font-semibold text-[var(--color-brand-700)]">
          {badge}
        </span>
      )}
    </div>
  );
}

const PREVIEW_METRICS = [
  { label: 'Queued posts', value: '18' },
  { label: 'Open deals', value: '42' },
  { label: 'Reach', value: '9.8k' },
];

const PREVIEW_ACTIVITY = [
  'Campaign approved for publishing',
  'Lead segment synced with CRM',
  'Automated email sent to new contacts',
];
