'use client';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CheckCircle2,
  Mail,
  Moon,
  PanelRightOpen,
  Search,
  Send,
  Sparkles,
  Sun,
  UsersRound,
} from 'lucide-react';
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
      <div className="relative flex min-h-[24rem] flex-col overflow-hidden bg-[radial-gradient(circle_at_24%_18%,var(--color-info-500)_0,transparent_25%),radial-gradient(circle_at_84%_24%,var(--color-brand-400)_0,transparent_28%),linear-gradient(135deg,var(--color-brand-800),var(--color-brand-700)_42%,var(--color-brand-500))] px-6 py-6 text-white sm:min-h-[30rem] sm:px-8 lg:min-h-screen lg:px-10 lg:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          {resolvedBrandMark}
          <span className="text-lg font-semibold tracking-normal">{brandName}</span>
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
      className="relative overflow-hidden rounded-xl border border-white/16 bg-background text-foreground shadow-2xl shadow-black/30"
      aria-hidden
    >
      <div className="flex h-9 items-center gap-1.5 border-border border-b bg-card px-3">
        <span className="size-2 rounded-full bg-rose-400" />
        <span className="size-2 rounded-full bg-amber-400" />
        <span className="size-2 rounded-full bg-emerald-400" />
      </div>
      <div className="min-h-[22rem] bg-background">
        <div
          data-testid="shell-auth-preview-shell-header"
          className="flex h-11 items-center justify-between border-shell-border border-b bg-shell-header px-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" />
            </span>
            <span className="truncate text-[11px] font-semibold">Medal Social</span>
            <div className="ml-2 hidden items-center sm:flex">
              {PREVIEW_TABS.map((tab) => (
                <span
                  key={tab}
                  className={cx(
                    'px-2 py-1 text-[10px] font-medium',
                    tab === 'Inbox'
                      ? 'border-primary border-b-2 text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden rounded-md bg-primary px-2 py-1 text-[9px] font-semibold text-primary-foreground sm:inline-flex">
              + New
            </span>
            <span className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground">
              <PanelRightOpen className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="grid min-h-[19.25rem] grid-cols-[44px_minmax(0,1fr)] overflow-hidden sm:grid-cols-[44px_124px_minmax(0,1fr)_118px] lg:grid-cols-[48px_148px_minmax(0,1fr)_136px]">
          <aside
            data-testid="shell-auth-preview-icon-rail"
            className="flex flex-col items-center gap-1 border-shell-border border-r bg-shell-rail py-2"
          >
            {PREVIEW_RAIL_ITEMS.map((item) => (
              <PreviewRailItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={item.active}
                badge={item.badge}
              />
            ))}
            <span className="mt-auto inline-flex size-8 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
              AS
            </span>
          </aside>

          <aside
            data-testid="shell-auth-preview-context-rail"
            className="hidden flex-col border-shell-border border-r bg-shell-context sm:flex"
          >
            <div className="border-shell-border border-b px-3 py-3">
              <p className="text-[11px] font-semibold text-foreground">Customer OS</p>
              <p className="mt-0.5 truncate text-[9px] text-muted-foreground">Auto-CS workspace</p>
            </div>
            <nav className="flex flex-col gap-0.5 p-2">
              {PREVIEW_CONTEXT_ITEMS.map((item) => (
                <PreviewContextItem key={item.label} {...item} />
              ))}
            </nav>
            <div className="mt-auto border-shell-border border-t p-2">
              <p className="text-[9px] font-medium text-muted-foreground">Next sync</p>
              <p className="mt-1 truncate text-[10px] font-semibold text-foreground">
                12 campaigns
              </p>
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden bg-shell-main p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase text-muted-foreground">
                  Inbox command center
                </p>
                <p className="mt-1 truncate text-sm font-semibold">Launch queue and support</p>
              </div>
              <span className="rounded-md bg-success/12 px-2 py-1 text-[9px] font-semibold text-success">
                Live
              </span>
            </div>

            <div className="mb-3 flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2 text-muted-foreground shadow-sm">
              <Search className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate text-[10px]">Ask Meda to draft a customer reply...</span>
              <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground sm:inline">
                CMD K
              </kbd>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {PREVIEW_METRICS.map((metric) => (
                <div key={metric.label} className="rounded-md border border-border bg-card p-2">
                  <p className="text-[9px] font-medium text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-base font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_112px]">
              <div className="rounded-md border border-border bg-card p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold">Priority work</p>
                  <p className="text-[9px] text-muted-foreground">Updated now</p>
                </div>
                <div className="space-y-2">
                  {PREVIEW_ACTIVITY.map((item) => (
                    <PreviewActivityRow key={item} label={item} />
                  ))}
                </div>
              </div>

              <div className="hidden rounded-md border border-border bg-card p-2.5 lg:block">
                <p className="text-[10px] font-semibold">Publish health</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[72%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                  Response SLA and scheduled posts are on track.
                </p>
              </div>
            </div>
          </main>

          <aside
            data-testid="shell-auth-preview-right-panel"
            className="hidden flex-col border-shell-border border-l bg-shell-panel sm:flex"
          >
            <div className="flex items-center justify-between border-shell-border border-b px-3 py-2">
              <p className="text-[11px] font-semibold">Copilot</p>
              <span className="size-2 rounded-full bg-success" />
            </div>
            <div className="space-y-2 p-3">
              <div className="rounded-md border border-border bg-card p-2">
                <p className="text-[9px] font-medium text-muted-foreground">Suggested next step</p>
                <p className="mt-1 text-[10px] font-semibold leading-4">
                  Reply to creator payout thread.
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-2">
                <p className="text-[9px] font-medium text-muted-foreground">Insights</p>
                <p className="mt-1 text-[10px] leading-4">
                  Support volume is down 18% after automation changes.
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <p className="text-[10px] font-semibold">Draft ready</p>
                <p className="mt-1 text-[9px] leading-4">Review before sending.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PreviewRailItem({
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
    <span
      className={cx(
        'relative inline-flex size-8 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-primary/12 text-primary' : 'text-muted-foreground'
      )}
      title={label}
    >
      <Icon className="size-4" aria-hidden="true" />
      {badge && <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary" />}
    </span>
  );
}

function PreviewContextItem({
  icon: Icon,
  label,
  active,
  shortcut,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  shortcut?: string;
}) {
  return (
    <span
      className={cx(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] transition-colors',
        active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
      {shortcut && (
        <kbd className="ml-auto font-mono text-[8px] text-muted-foreground">{shortcut}</kbd>
      )}
    </span>
  );
}

function PreviewActivityRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="size-3" aria-hidden="true" />
      </span>
      <p className="truncate text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

const PREVIEW_TABS = ['Home', 'Inbox', 'Campaigns'];

const PREVIEW_RAIL_ITEMS = [
  { icon: BarChart3, label: 'Overview' },
  { icon: Mail, label: 'Inbox', active: true, badge: '4' },
  { icon: Send, label: 'Posts' },
  { icon: UsersRound, label: 'Contacts' },
];

const PREVIEW_CONTEXT_ITEMS = [
  { icon: BarChart3, label: 'Overview', shortcut: '1' },
  { icon: Mail, label: 'Inbox', active: true, shortcut: '2' },
  { icon: Send, label: 'Posts', shortcut: '3' },
  { icon: UsersRound, label: 'Contacts', shortcut: '4' },
];

const PREVIEW_METRICS = [
  { label: 'Queued posts', value: '18' },
  { label: 'Open tickets', value: '42' },
  { label: 'Reach', value: '9.8k' },
];

const PREVIEW_ACTIVITY = [
  'Campaign approved for publishing',
  'Lead segment synced with CRM',
  'Automated reply drafted for review',
];
