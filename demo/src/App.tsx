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
      <div className="preview-canvas preview-canvas--flush">
        <ShellStateProvider
          adapter={{
            searchParams,
            setSearchParams: (updater) => setSearchParams((current) => updater(current)),
          }}
        >
          <ShellFrame
            header={
              <div className="flex h-full w-full items-center justify-between px-4 text-sm">
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
              <nav className="flex h-full w-40 flex-col gap-0.5 border-r border-[var(--border)] bg-[var(--sidebar)] p-3 text-sm">
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
            toolbar={
              <div className="flex h-10 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-3 text-xs">
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
              <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--muted-foreground)]">
                <div className="rounded-xl border border-dashed border-[var(--border)] px-12 py-8 text-center">
                  Canvas
                  <div className="mt-1 text-xs">main region</div>
                </div>
              </div>
            }
            aside={
              <div className="h-full w-64 border-l border-[var(--border)] bg-[var(--card)] p-4 text-sm">
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
        <div className="w-full">
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
        </div>
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
