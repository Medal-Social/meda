import {
  ShellAppRail,
  ShellFrame,
  ShellHeaderFrame,
  ShellModuleNav,
  ShellPanelToggle,
  ShellStateProvider,
  ShellTabBar,
  WorkbenchLayout,
} from '@medalsocial/meda';
import { type ToolCall, TranscriptStream, type Turn } from '@medalsocial/meda/chat';
import {
  Inspector,
  InspectorField,
  InspectorJSON,
  type InspectorTab,
} from '@medalsocial/meda/panel';
import {
  ScrubBar,
  type ScrubMark,
  type TimelineEvent,
  TimelineRail,
} from '@medalsocial/meda/timeline';
import {
  Bell,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  PanelLeft,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { ComponentDoc } from './ComponentDoc';

const registryItems = [
  {
    name: 'meda-shell',
    title: 'Shell',
    description:
      'The full app shell: frame, header, app rail, module nav, panel rail, tab bar, scrollable content.',
  },
  {
    name: 'meda-shell-state',
    title: 'Shell State',
    description:
      'Router-agnostic state provider for panels, selection, rails, and command palette via URL params.',
  },
  {
    name: 'meda-workbench-layout',
    title: 'Workbench Layout',
    description:
      'Three-column workbench layout with resizable side-panel dock and scrollable content area.',
  },
] as const;

export function App() {
  return (
    <div className="dark">
      <div className="page">
        <nav className="nav">
          <div className="brand">
            <span className="brand-dot" />
            <span>@medalsocial/meda</span>
          </div>
          <div className="nav-links">
            <a href="#install">Install</a>
            <a href="#components">Components</a>
            <a href="#registry">Registry</a>
            <a
              href="https://www.npmjs.com/package/@medalsocial/meda"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <a href="https://github.com/Medal-Social/meda" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </nav>

        <section className="hero">
          <span className="badge">
            <span>v0.1.1</span>
            <span>·</span>
            <span>Apache-2.0</span>
            <span>·</span>
            <span>React 19</span>
          </span>
          <h1>
            <em>The shell that runs Medal.</em>
          </h1>
          <p className="lead">
            Production-tested React primitives for app shells, navigation, panels, command palettes,
            and workbench layouts. Ship it as an npm package, or copy source into your project via
            the shadcn-compatible registry — whichever fits your taste.
          </p>
          <div className="cta-row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigator.clipboard.writeText('pnpm add @medalsocial/meda')}
            >
              pnpm add @medalsocial/meda
            </button>
            <a
              className="btn btn-secondary"
              href="https://github.com/Medal-Social/meda"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub →
            </a>
          </div>
        </section>

        {/* ───────────── Install paths ───────────── */}
        <section id="install" className="section">
          <div className="section-header">
            <div className="eyebrow">Install</div>
            <h2 className="section-title">Two ways to use meda</h2>
            <p className="section-sub">
              Pick whichever fits your team. Both ship the same components — the difference is
              whether you own the source or treat it as a versioned dependency.
            </p>
          </div>
          <div className="install-grid">
            <div className="install-card">
              <div className="install-card-label">
                <span>◆ npm package</span>
              </div>
              <h3>Install as a dependency</h3>
              <p>
                Standard install. Compiled <code>dist/</code> ships to npm, upgrades flow through
                your lockfile, types are included. Best when you want Medal to own the component
                evolution.
              </p>
              <pre className="codeblock">
                <span className="prompt">$ </span>pnpm add @medalsocial/meda
                {'\n\n'}
                <span className="comment">{'/* your entry CSS */'}</span>
                {'\n'}@import <span className="tok-str">'@medalsocial/meda/styles.css'</span>;
              </pre>
            </div>
            <div className="install-card">
              <div className="install-card-label">
                <span>◆ shadcn registry</span>
              </div>
              <h3>Copy source into your repo</h3>
              <p>
                shadcn CLI copies the source files into your project. You own them, fork them, tweak
                them. Best when you want full control over Tailwind classes and component internals.
              </p>
              <pre className="codeblock">
                <span className="prompt">$ </span>npx shadcn add \{'\n'}
                {'  '}https://meda.medalsocial.com/r/meda-shell.json
              </pre>
            </div>
          </div>
        </section>

        {/* ───────────── Per-component gallery ───────────── */}
        <section id="components" className="section">
          <div className="section-header section-header--left">
            <div className="eyebrow">Components</div>
            <h2 className="section-title">Live demos for every primitive</h2>
            <p className="section-sub">
              The shell broken into composable pieces. Every preview below is the actual component
              from the published <code>@medalsocial/meda</code> package, rendered on this page with
              real props.
            </p>
          </div>

          <ShellFrameDemo />
          <WorkbenchDemo />
          <AppRailDemo />
          <ModuleNavDemo />
          <TabBarDemo />
          <HeaderFrameDemo />
          <TimelineDemo />
          <ChatDemo />
          <PanelDemo />
        </section>

        {/* ───────────── Shadcn registry ───────────── */}
        <section id="registry" className="section section--subtle">
          <div className="section-header section-header--left">
            <div className="eyebrow">Shadcn registry</div>
            <h2 className="section-title">Composable registry items</h2>
            <p className="section-sub">
              Three shadcn-compatible registry items, each independently installable and carrying
              its own <code>registryDependencies</code>. The full component library above is always
              available via the npm package — the registry is for consumers who want source-level
              ownership.
            </p>
          </div>
          <div className="registry-grid">
            {registryItems.map((item) => (
              <div className="registry-card" key={item.name}>
                <div className="registry-name">@meda / {item.name}</div>
                <h3 className="registry-title">{item.title}</h3>
                <p className="registry-desc">{item.description}</p>
                <pre className="registry-cmd">{`npx shadcn add \\
  …/r/${item.name}.json`}</pre>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-meta">© 2026 Medal Social · Apache-2.0</div>
            <div className="footer-links">
              <a
                href="https://github.com/Medal-Social/meda/blob/prod/LICENSE"
                target="_blank"
                rel="noreferrer"
              >
                License
              </a>
              <a
                href="https://github.com/Medal-Social/meda/blob/prod/CONTRIBUTING.md"
                target="_blank"
                rel="noreferrer"
              >
                Contributing
              </a>
              <a
                href="https://www.npmjs.com/package/@medalsocial/meda"
                target="_blank"
                rel="noreferrer"
              >
                npm
              </a>
              <a href="https://github.com/Medal-Social/meda" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Individual component demos
   ═══════════════════════════════════════════════════════════════ */

function ShellFrameDemo() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  return (
    <ComponentDoc
      name="ShellFrame"
      description="The main app shell frame. Three render-prop slots: header, navigation, content. Composes with ShellStateProvider for panel + selection state."
      registryItem="meda-shell"
      code={`import { ShellFrame, ShellStateProvider } from '@medalsocial/meda';

<ShellStateProvider adapter={adapter}>
  <ShellFrame
    header={<YourHeader />}
    navigation={<YourNav />}
    content={<YourPage />}
  />
</ShellStateProvider>`}
    >
      <div className="preview-canvas preview-canvas--shell">
        <ShellStateProvider
          adapter={{
            searchParams,
            setSearchParams: (updater) => setSearchParams((current) => updater(current)),
          }}
        >
          <ShellFrame
            header={
              <div className="flex h-12 w-full shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Workspace</span>
                  <span className="text-[var(--muted-foreground)]">/ Projects</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--input)] px-2 py-1 text-xs text-[var(--muted-foreground)]">
                  <span>Search…</span>
                  <span className="font-mono">⌘K</span>
                </div>
              </div>
            }
            navigation={
              <nav className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-[var(--border)] bg-[var(--sidebar)] p-3 text-sm">
                {[
                  { label: 'Inbox' },
                  { label: 'Projects', active: true },
                  { label: 'Team' },
                  { label: 'Settings' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={
                      item.active
                        ? 'rounded-md bg-[var(--sidebar-accent)] px-2.5 py-1.5 text-[var(--sidebar-accent-foreground)]'
                        : 'rounded-md px-2.5 py-1.5 text-[var(--muted-foreground)]'
                    }
                  >
                    {item.label}
                  </div>
                ))}
              </nav>
            }
            content={
              <main className="p-6">
                <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-[var(--primary)]">
                  Projects
                </div>
                <h3 className="text-xl font-semibold tracking-tight">Shell composition</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Header, navigation, and content are render-prop slots.
                </p>
              </main>
            }
          />
        </ShellStateProvider>
      </div>
    </ComponentDoc>
  );
}

function WorkbenchDemo() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  return (
    <ComponentDoc
      name="WorkbenchLayout"
      description="Three-region workbench: toolbar strip on top, main content area, optional aside for previews / inspectors / side panels."
      registryItem="meda-workbench-layout"
      code={`import { WorkbenchLayout } from '@medalsocial/meda';

<WorkbenchLayout
  viewportBand="desktop" // mobile | tablet | desktop | wide | ultrawide
  toolbar={<Toolbar />}
  main={<Canvas />}
  aside={<Inspector />}
/>`}
    >
      <div className="preview-canvas preview-canvas--flush">
        <ShellStateProvider
          adapter={{
            searchParams,
            setSearchParams: (updater) => setSearchParams((current) => updater(current)),
          }}
        >
          <WorkbenchLayout
            viewportBand="desktop"
            className="p-5"
            toolbar={
              <div className="flex h-10 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs">
                <button
                  type="button"
                  className="rounded px-2 py-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  File
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  View
                </button>
                <div className="ml-auto text-[var(--muted-foreground)]">Autosaved · 2s ago</div>
              </div>
            }
            main={
              <div className="flex min-h-60 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
                <div className="rounded-xl border border-dashed border-[var(--border)] px-12 py-8 text-center">
                  Canvas
                  <div className="mt-1 text-xs">main region</div>
                </div>
              </div>
            }
            aside={
              <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--primary)]">
                  Inspector
                </div>
                <div className="space-y-2 text-[var(--muted-foreground)]">
                  <div className="flex justify-between">
                    <span>width</span>
                    <span className="font-mono text-[var(--foreground)]">320</span>
                  </div>
                  <div className="flex justify-between">
                    <span>height</span>
                    <span className="font-mono text-[var(--foreground)]">auto</span>
                  </div>
                  <div className="flex justify-between">
                    <span>radius</span>
                    <span className="font-mono text-[var(--foreground)]">0.75rem</span>
                  </div>
                </div>
              </div>
            }
          />
        </ShellStateProvider>
      </div>
    </ComponentDoc>
  );
}

function AppRailDemo() {
  return (
    <ComponentDoc
      name="ShellAppRail"
      description="Left-hand vertical icon rail for top-level navigation. Main items grouped at top, utility items at bottom. Consumer chooses icons and routing."
      registryItem="meda-shell"
      code={`import { ShellAppRail } from '@medalsocial/meda';
import { Home, Inbox, Users } from 'lucide-react';
import { Link } from 'react-router'; // or your router's Link

<ShellAppRail
  mainItems={[
    { to: '/', label: 'Home', icon: Home },
    { to: '/inbox', label: 'Inbox', icon: Inbox },
    { to: '/team', label: 'Team', icon: Users },
  ]}
  utilityItems={[
    { to: '/search', label: 'Search', icon: Search },
  ]}
  isItemActive={(item) => item.to === pathname}
  renderLink={({ item, className, children }) => (
    <Link to={item.to} className={className}>
      {children}
    </Link>
  )}
/>`}
    >
      <div className="preview-canvas">
        <ShellAppRail
          mainItems={[
            { to: '/', label: 'Home', icon: Home },
            { to: '/inbox', label: 'Inbox', icon: Inbox },
            { to: '/projects', label: 'Projects', icon: FolderOpen },
            { to: '/team', label: 'Team', icon: Users },
          ]}
          utilityItems={[
            { to: '/search', label: 'Search', icon: Search },
            { to: '/help', label: 'Help', icon: HelpCircle },
          ]}
          isItemActive={(item) => item.to === '/projects'}
          renderLink={({ item, className, children }) => (
            <a
              key={item.to}
              href={item.to}
              onClick={(event) => event.preventDefault()}
              className={className}
              aria-label={item.label}
            >
              {children}
            </a>
          )}
        />
      </div>
    </ComponentDoc>
  );
}

function ModuleNavDemo() {
  return (
    <ComponentDoc
      name="ShellModuleNav"
      description="Module sidebar with title, description, and a list of nav items (icon + label + optional description + shortcut). Used inside a module's own layout."
      registryItem="meda-shell"
      code={`import { ShellModuleNav } from '@medalsocial/meda';
import { Link } from 'react-router'; // or your router's Link

<ShellModuleNav
  module={{
    id: 'inbox',
    label: 'Inbox',
    description: 'All your activity',
    items: [
      { to: '/inbox/all', label: 'All', icon: Inbox },
      { to: '/inbox/mentions', label: 'Mentions', icon: Bell, shortcut: '⌘⇧M' },
    ],
  }}
  isItemActive={(item) => item.to === pathname}
  renderLink={({ item, className, children }) => (
    <Link to={item.to} className={className}>
      {children}
    </Link>
  )}
/>`}
    >
      <div className="preview-canvas preview-canvas--flush">
        <aside className="flex w-full flex-col bg-[var(--sidebar)] px-3 py-4">
          <ShellModuleNav
            module={{
              id: 'inbox',
              label: 'Inbox',
              description: 'All your activity, in one place',
              items: [
                { to: '/inbox/all', label: 'All', icon: Inbox, shortcut: '⌘1' },
                { to: '/inbox/mentions', label: 'Mentions', icon: Bell, shortcut: '⌘2' },
                { to: '/inbox/threads', label: 'Threads', icon: MessageSquare, shortcut: '⌘3' },
                { to: '/inbox/docs', label: 'Documents', icon: FileText },
              ],
            }}
            ariaLabel="Inbox pages"
            className="min-h-0 flex-1"
            headerClassName="mb-1 flex items-start px-3 pb-3"
            titleClassName="text-[11px] font-bold tracking-widest text-[var(--sidebar-primary)] uppercase"
            descriptionClassName="mt-0.5 text-[11px] text-[var(--muted-foreground)]"
            itemsClassName="flex flex-col gap-0.5 pt-1"
            itemClassName="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors"
            activeItemClassName="bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
            inactiveItemClassName="text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
            itemIconClassName="mt-0.5 shrink-0"
            itemLabelClassName="text-[14px] font-medium leading-tight"
            itemShortcutClassName="ml-auto shrink-0 rounded bg-[var(--sidebar-accent)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]"
            isItemActive={(item) => item.to === '/inbox/mentions'}
            renderLink={({ item, className, children }) => (
              <a
                key={item.to}
                href={item.to}
                onClick={(event) => event.preventDefault()}
                className={className}
              >
                {children}
              </a>
            )}
          />
        </aside>
      </div>
    </ComponentDoc>
  );
}

function TabBarDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <ComponentDoc
      name="ShellTabBar"
      description="Horizontal, scrollable tab strip. Provide tabs array + active id + change handler. Renders with underline indicator."
      registryItem="meda-shell"
      code={`import { ShellTabBar } from '@medalsocial/meda';

<ShellTabBar
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>`}
    >
      <div className="preview-canvas">
        <div className="w-full">
          <ShellTabBar
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Activity' },
              { id: 'members', label: 'Members' },
              { id: 'integrations', label: 'Integrations' },
              { id: 'settings', label: 'Settings' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ariaLabel="Example tabs"
          />
          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
            Active tab: <code className="font-mono text-[var(--foreground)]">{activeTab}</code>
          </div>
        </div>
      </div>
    </ComponentDoc>
  );
}

function HeaderFrameDemo() {
  const [open, setOpen] = useState(true);
  return (
    <ComponentDoc
      name="ShellHeaderFrame · ShellPanelToggle"
      description="The header region slot (left · center · right grid) and the open/close toggle button used to show or hide the side panel dock."
      registryItem="meda-shell"
      code={`import { ShellHeaderFrame, ShellPanelToggle } from '@medalsocial/meda';

<ShellHeaderFrame
  left={<Breadcrumbs />}
  center={<PageTitle />}
  right={
    <ShellPanelToggle
      panelOpen={open}
      onToggle={() => setOpen(o => !o)}
    />
  }
/>`}
    >
      <div className="preview-canvas preview-canvas--flush">
        <div className="w-full">
          <ShellHeaderFrame
            left={
              <div className="flex items-center gap-2 text-sm">
                <LayoutDashboard className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="font-medium">Dashboard</span>
                <span className="text-[var(--muted-foreground)]">/</span>
                <span className="text-[var(--muted-foreground)]">Q3 report</span>
              </div>
            }
            center={
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>meda.medalsocial.com</span>
              </div>
            }
            right={
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <ShellPanelToggle panelOpen={open} onToggle={() => setOpen((o) => !o)} />
              </div>
            }
          />
          <div className="flex items-center justify-between p-4 text-xs text-[var(--muted-foreground)]">
            <span>
              Panel: <code className="font-mono">{open ? 'open' : 'closed'}</code>
            </span>
            <span className="flex items-center gap-1.5">
              <PanelLeft className="h-3.5 w-3.5" />
              toggle to see state change
            </span>
          </div>
        </div>
      </div>
    </ComponentDoc>
  );
}

/* ═══════════════════════════════════════════════════════════════
   v0.3.0 activity primitive demos
   ═══════════════════════════════════════════════════════════════ */

const NOW = new Date();

const fixtureEvents: TimelineEvent[] = [
  {
    id: 'live',
    startedAt: NOW.getTime() - 134_000,
    isLive: true,
    kind: 'session',
    primary: 'Morpheus',
    secondary: '4 turns · $0.07',
  },
  {
    id: 'past1',
    startedAt: NOW.getTime() - 4 * 3600 * 1000,
    endedAt: NOW.getTime() - 4 * 3600 * 1000 + 8 * 60 * 1000,
    kind: 'session',
    primary: 'Morpheus',
    secondary: '14 turns · $0.31',
  },
  {
    id: 'past2',
    startedAt: NOW.getTime() - 6 * 3600 * 1000,
    endedAt: NOW.getTime() - 6 * 3600 * 1000 + 3 * 60 * 1000,
    kind: 'session',
    primary: 'Kitchen',
    secondary: '5 turns · $0.04',
  },
  {
    id: 'sched',
    startedAt: NOW.getTime() + 90 * 60 * 1000,
    kind: 'scheduled',
    primary: 'Daily recap',
    secondary: 'outbound',
  },
];

function TimelineDemo() {
  const [date, setDate] = useState(NOW);
  return (
    <ComponentDoc
      name="TimelineRail"
      description="Vertical timeline sidebar showing live, past, and scheduled sessions. Tape auto-scrolls to keep LIVE events visible. Prev/next date switching included."
      registryItem="meda-shell"
      code={`import { TimelineRail, type TimelineEvent } from '@medalsocial/meda/timeline';

<TimelineRail
  date={date}
  now={now}
  events={events}
  onDateChange={setDate}
  onSelect={(e) => console.log('select', e.id)}
/>`}
    >
      <div className="preview-canvas preview-canvas--flush" style={{ height: 420 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100%' }}>
          <TimelineRail
            date={date}
            now={NOW}
            events={fixtureEvents}
            onDateChange={setDate}
            onSelect={(e) => console.log('timeline select', e.id)}
          />
          <div className="flex flex-col gap-2 p-5">
            <p className="text-sm font-medium">TimelineRail</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              1 live event · 2 past · 1 scheduled. Click events; use prev/next to change date;
              observe LIVE pin auto-scroll.
            </p>
            <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
              date: {date.toDateString()}
            </p>
          </div>
        </div>
      </div>
    </ComponentDoc>
  );
}

const scrubMarks: ScrubMark[] = [
  { id: 'm1', positionPct: 5, kind: 'turn', label: 'Turn 1' },
  { id: 'm2', positionPct: 22, kind: 'tool', label: 'calendar.list' },
  { id: 'm3', positionPct: 44, kind: 'barge', label: 'Barge-in' },
  { id: 'm4', positionPct: 68, kind: 'turn', label: 'Turn 3' },
  { id: 'm5', positionPct: 85, kind: 'error', label: 'TTS timeout' },
];

const fixtureTurns: Turn[] = [
  {
    id: 't1',
    speaker: 'user',
    speakerLabel: 'Ali',
    text: 'Hey, what do I have on my calendar tomorrow?',
    startedAt: NOW.getTime() - 120_000,
  },
  {
    id: 't2',
    speaker: 'assistant',
    speakerLabel: 'Morpheus',
    modelLabel: 'claude-opus-4-7',
    text: 'Let me pull that up for you.',
    startedAt: NOW.getTime() - 118_000,
    latency: { sttMs: 210, claudeMs: 440, ttsMs: 180 },
    toolCalls: [
      {
        id: 'tc1',
        name: 'calendar.list',
        args: { date: 'tomorrow', maxResults: 10 },
        resultSummary: '3 events',
        latencyMs: 320,
      } satisfies ToolCall,
    ],
  },
  {
    id: 't3',
    speaker: 'assistant',
    speakerLabel: 'Morpheus',
    text: 'You have a stand-up at 9 AM, lunch with the team at noon, and a 3 PM design review…',
    startedAt: NOW.getTime() - 5_000,
    streaming: true,
  },
];

function ChatDemo() {
  const [positionMs, setPositionMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const durationMs = 130_000;
  return (
    <ComponentDoc
      name="ScrubBar · TranscriptStream · ToolCallBlock"
      description="Per-conversation playback controls (ScrubBar with turn/tool/barge/error marks) paired with a scrollable TranscriptStream that renders TurnCards including inline ToolCallBlocks and latency badges."
      registryItem="meda-shell"
      code={`import { ScrubBar, TranscriptStream } from '@medalsocial/meda/chat';

<ScrubBar
  durationMs={durationMs}
  positionMs={positionMs}
  isLive={false}
  marks={marks}
  onSeek={setPositionMs}
  isPlaying={isPlaying}
  onPlayPause={() => setIsPlaying(p => !p)}
/>
<TranscriptStream turns={turns} />`}
    >
      <div className="preview-canvas preview-canvas--flush">
        <div className="flex flex-col" style={{ height: 440 }}>
          <ScrubBar
            durationMs={durationMs}
            positionMs={positionMs}
            isLive={false}
            marks={scrubMarks}
            onSeek={setPositionMs}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying((p) => !p)}
            onSkipBack={() => setPositionMs(0)}
            onSkipForward={() => setPositionMs(durationMs)}
          />
          <div className="min-h-0 flex-1 overflow-hidden">
            <TranscriptStream turns={fixtureTurns} />
          </div>
        </div>
      </div>
    </ComponentDoc>
  );
}

const inspectorTabs: InspectorTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    content: (
      <div className="px-3.5 py-2">
        <InspectorField label="Session ID" value="sess_01jx7k2" />
        <InspectorField label="Agent" value="Morpheus" hint="claude-opus-4-7" />
        <InspectorField label="Duration" value="2 m 14 s" />
        <InspectorField label="Turns" value="4" />
        <InspectorField label="Cost" value="$0.07" />
      </div>
    ),
  },
  {
    id: 'personality',
    label: 'Personality',
    content: (
      <div className="min-h-0 flex-1 overflow-auto px-3.5 py-2">
        <InspectorJSON
          data={{
            name: 'Morpheus',
            voice: 'ash',
            model: 'claude-opus-4-7',
            systemPrompt: 'You are a calm, concise assistant…',
            tools: ['calendar.list', 'calendar.create', 'reminders.set'],
            temperature: 1,
          }}
        />
      </div>
    ),
  },
  {
    id: 'logs',
    label: 'Logs',
    content: (
      <pre className="overflow-auto px-3.5 py-2 font-mono text-[11px] text-muted-foreground">
        {`[10:14:01.032] session started sess_01jx7k2
[10:14:01.210] STT stream open
[10:14:02.440] claude request sent
[10:14:02.880] tool: calendar.list args={date:"tomorrow"}
[10:14:03.200] tool result: 3 events
[10:14:03.640] TTS stream open
[10:14:04.180] TTS first chunk
[10:14:15.310] session ended (clean)`}
      </pre>
    ),
  },
];

function PanelDemo() {
  return (
    <ComponentDoc
      name="Inspector · InspectorField · InspectorJSON"
      description="Tabbed inspector panel for session details. InspectorField renders labelled key-value rows; InspectorJSON renders syntax-highlighted JSON; tabs are fully customisable."
      registryItem="meda-shell"
      code={`import { Inspector, InspectorField, InspectorJSON } from '@medalsocial/meda/panel';
import type { InspectorTab } from '@medalsocial/meda/panel';

const tabs: InspectorTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    content: (
      <>
        <InspectorField label="Agent" value="Morpheus" hint="claude-opus-4-7" />
        <InspectorField label="Duration" value="2 m 14 s" />
      </>
    ),
  },
  // … personality (InspectorJSON), logs (plain text)
];

<Inspector tabs={tabs} defaultTab="overview" />`}
    >
      <div className="preview-canvas preview-canvas--flush" style={{ height: 380 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', height: '100%' }}>
          <div className="flex items-center justify-center border-r border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
            main content area
          </div>
          <Inspector tabs={inspectorTabs} defaultTab="overview" className="h-full" />
        </div>
      </div>
    </ComponentDoc>
  );
}
