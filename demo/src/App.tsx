'use client';
import type {
  AppDefinition,
  ContextModule,
  PanelView,
  WorkspaceDefinition,
} from '@medalsocial/meda';
import {
  AppShell,
  AppShellBody,
  CommandPalette,
  ContextRail,
  IconRail,
  MedaShellProvider,
  MobileBottomNav,
  MobileDrawers,
  MobileHeader,
  RightPanel,
  ShellHeader,
  ShellMain,
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
  BookOpen,
  Building2,
  FileText,
  FlaskConical,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  PanelRight,
  Search,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { ComponentDoc } from './ComponentDoc';

/* ─────────────────────────────────────────────────────────────────────────── *
 * Shared demo fixtures
 * ─────────────────────────────────────────────────────────────────────────── */

const WORKSPACE_ACME: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={18} aria-hidden="true" />,
};

const WORKSPACE_BETA: WorkspaceDefinition = {
  id: 'ws-beta',
  name: 'Beta Workspace',
  icon: <Zap size={18} aria-hidden="true" />,
};

const WORKSPACE_GAMMA: WorkspaceDefinition = {
  id: 'ws-gamma',
  name: 'Gamma Labs',
  icon: <FlaskConical size={18} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'team', label: 'Team', icon: Users },
];

const ICON_RAIL_ITEMS: ComponentProps<typeof IconRail>['mainItems'] = APPS.map((app) => ({
  id: app.id,
  label: app.label,
  icon: app.icon,
  to: `#${app.id}`,
}));

const CONTEXT_MODULE: ContextModule = {
  id: 'inbox',
  label: 'Inbox',
  description: 'All your activity, in one place',
  items: [
    { id: 'all', label: 'All', icon: Inbox, to: '/inbox/all', shortcut: '⌘1' },
    { id: 'mentions', label: 'Mentions', icon: Bell, to: '/inbox/mentions', shortcut: '⌘2' },
    { id: 'docs', label: 'Documents', icon: FileText, to: '/inbox/docs' },
    { id: 'threads', label: 'Threads', icon: MessageSquare, to: '/inbox/threads' },
  ],
};

const PANEL_VIEWS: PanelView[] = [
  {
    id: 'details',
    label: 'Details',
    icon: BookOpen,
    render: () => (
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Panel content</p>
        <p>This is the v2 right panel. It renders PanelView.render() for the active tab.</p>
      </div>
    ),
  },
  {
    id: 'ai',
    label: 'Assistant',
    icon: Sparkles,
    render: () => (
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">AI Assistant</p>
        <p>Wire up your AI chat here.</p>
      </div>
    ),
  },
];

const registryItems = [
  {
    name: 'meda-shell',
    title: 'Shell',
    description:
      'The full v2 app shell: AppShell, ShellHeader, IconRail, ContextRail, ShellMain, RightPanel, mobile variants.',
  },
  {
    name: 'meda-shell-state',
    title: 'Shell State',
    description:
      'MedaShellProvider: workspace/app/panel/command-palette state in one context. Zero dependencies on your router.',
  },
  {
    name: 'meda-workbench-layout',
    title: 'Extras',
    description:
      'Extras.WorkbenchLayout, Extras.ShellTabBar, Extras.ShellScrollableContent — legacy-compatible opt-in helpers.',
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────── *
 * App root
 * ─────────────────────────────────────────────────────────────────────────── */

export function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="page">
        <nav className="nav">
          <div className="brand">
            <span className="brand-dot" />
            <span>@medalsocial/meda</span>
          </div>
          <div className="nav-links">
            <a href="#install">Install</a>
            <a href="#shell">Shell v2</a>
            <a href="#components">Components</a>
            <a href="#registry">Registry</a>
            <a href="/storybook/">Storybook</a>
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
            <span>v1.0.0-rc.1</span>
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
                {'\n'}@import <span className="tok-str">'@medalsocial/meda/styles.css'</span>
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

        {/* ───────────── Shell v2 live demo ───────────── */}
        <section id="shell" className="section">
          <div className="section-header section-header--left">
            <div className="eyebrow">Shell v2</div>
            <h2 className="section-title">Full shell — live demo</h2>
            <p className="section-sub">
              <code>MedaShellProvider</code> wraps <code>AppShell</code> + regions. Click the icon
              rail, switch app tabs, open the right panel, or hit{' '}
              <kbd className="font-mono text-xs">⌘K</kbd> for the command palette.
            </p>
          </div>
          <ShellV2Demo />
        </section>

        {/* ───────────── Per-component gallery ───────────── */}
        <section id="components" className="section">
          <div className="section-header section-header--left">
            <div className="eyebrow">Components</div>
            <h2 className="section-title">Live demos for every primitive</h2>
            <p className="section-sub">
              Activity, chat, and inspector primitives. Every preview below is the actual component
              from the published <code>@medalsocial/meda</code> package, rendered on this page.
            </p>
          </div>

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
          <div className="footer-showcase">
            <div className="footer-brand-block">
              <div className="footer-kicker">Open-source UI software</div>
              <div className="footer-lockup">
                <MedalSocialMark className="footer-mark footer-mark--meda" />
                <div className="footer-lockup-copy">
                  <div className="footer-logo-title">Meda UI</div>
                  <p>The interface shell, primitives, and design tokens behind Medal.</p>
                </div>
              </div>
            </div>

            <div className="footer-divider" aria-hidden="true" />

            <div className="footer-brand-block">
              <div className="footer-kicker">Maintained by</div>
              <a
                className="footer-lockup footer-lockup--link"
                href="https://medalsocial.com"
                target="_blank"
                rel="noreferrer"
              >
                <MedalSocialMark className="footer-mark footer-mark--medal" />
                <div className="footer-lockup-copy">
                  <div className="footer-logo-title">Medal Social</div>
                  <p>Designed, shipped, and battle-tested by the team building Medal.</p>
                </div>
              </a>
            </div>
          </div>

          <div className="footer-inner">
            <div className="footer-meta">© 2026 Medal Social · Apache-2.0 · React 19</div>
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

function MedalSocialMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <rect className="footer-mark-bg" width="48" height="48" rx="10" />
      <path className="footer-mark-line" d="M8 24L24 8L40 24L24 40L8 24Z" strokeWidth="1.3" />
      <circle className="footer-mark-fill" cx="24" cy="8.5" r="2.5" />
      <circle className="footer-mark-fill" cx="39.5" cy="24" r="2.5" />
      <circle className="footer-mark-fill" cx="24" cy="39.5" r="2.5" />
      <circle className="footer-mark-fill" cx="8.5" cy="24" r="2.5" />
      <path
        className="footer-mark-line"
        d="M21.937 27.5A2 2 0 0 0 20.5 26.063l-6.135-1.582a0.5 0.5 0 0 1 0-0.962l6.135-1.583A2 2 0 0 0 21.937 20.5l1.582-6.135a0.5 0.5 0 0 1 0.963 0l1.581 6.135A2 2 0 0 0 27.5 21.937l6.135 1.581a0.5 0.5 0 0 1 0 0.964L27.5 26.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a0.5 0.5 0 0 1-0.963 0z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Shell v2 full demo
   ═══════════════════════════════════════════════════════════════ */

function ShellV2Demo() {
  const [activeItem, setActiveItem] = useState('all');

  return (
    <ComponentDoc
      name="AppShell · ShellHeader · IconRail · ContextRail · ShellMain · RightPanel"
      description="The v2 shell composition. MedaShellProvider manages all state. AppShell + AppShellBody define the layout grid. Regions slot in as children."
      registryItem="meda-shell"
      code={`import {
  AppShell, AppShellBody, CommandPalette, ContextRail,
  IconRail, MedaShellProvider, MobileBottomNav, MobileDrawers,
  MobileHeader, RightPanel, ShellHeader, ShellMain,
} from '@medalsocial/meda';

<MedaShellProvider workspace={ws} apps={apps} panelViews={panels}>
  <CommandPalette />
  <AppShell>
    <ShellHeader />
    <AppShellBody>
      <IconRail mainItems={railItems} activeId="inbox" />
      <ContextRail modules={[module]} activeItemId={id} onItemClick={setId} />
      <ShellMain><YourPage /></ShellMain>
      <RightPanel />
    </AppShellBody>
    {/* Mobile */}
    <MobileHeader />
    <MobileDrawers modules={[module]} activeItemId={id} onItemClick={setId} />
    <MobileBottomNav items={bottomNavItems} />
  </AppShell>
</MedaShellProvider>`}
    >
      <div className="preview-canvas preview-canvas--shell" style={{ height: 560 }}>
        <MedaShellProvider
          workspace={WORKSPACE_ACME}
          workspaces={[WORKSPACE_ACME, WORKSPACE_BETA, WORKSPACE_GAMMA]}
          apps={APPS}
          defaultActiveApp="inbox"
          panelViews={PANEL_VIEWS}
          themeAdapter="default"
        >
          <CommandPalette />
          <AppShell>
            <ShellHeader />
            <AppShellBody>
              <IconRail mainItems={ICON_RAIL_ITEMS} activeId="inbox" />
              <ContextRail
                modules={[CONTEXT_MODULE]}
                activeItemId={activeItem}
                onItemClick={(item) => setActiveItem(item.id)}
              />
              <ShellMain>
                <div className="flex flex-col gap-4 p-6">
                  <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    Inbox
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {CONTEXT_MODULE.items.find((i) => i.id === activeItem)?.label ?? 'All'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Active item: <code className="font-mono">{activeItem}</code>. Click items in the
                    context rail to switch. Open the right panel via the header toggle.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press <kbd className="font-mono text-xs">⌘K</kbd> to open the command palette.
                  </p>
                </div>
              </ShellMain>
              <RightPanel />
            </AppShellBody>
            <MobileHeader />
            <MobileDrawers
              modules={[CONTEXT_MODULE]}
              activeItemId={activeItem}
              onItemClick={(item) => setActiveItem(item.id)}
            />
            <MobileBottomNav
              items={[
                { id: 'menu', label: 'Menu', icon: LayoutDashboard, opens: 'menu-drawer' },
                { id: 'search', label: 'Search', icon: Search, opens: 'module-drawer' },
                { id: 'panels', label: 'Panels', icon: PanelRight, opens: 'panels-drawer' },
                { id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' },
              ]}
            />
          </AppShell>
        </MedaShellProvider>
      </div>
    </ComponentDoc>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Activity primitive demos
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
