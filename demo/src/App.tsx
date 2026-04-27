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
  useMedaShell,
} from '@medalsocial/meda';
import { MedalSocialMark } from '@medalsocial/meda/brand';
import { type ToolCall, TranscriptStream, type Turn } from '@medalsocial/meda/chat';
import {
  MarketingCallout,
  MarketingContact,
  MarketingLeadMagnet,
} from '@medalsocial/meda/marketing';
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
import { type ComponentProps, useEffect, useRef, useState } from 'react';
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
  {
    name: 'meda-marketing',
    title: 'Marketing',
    description: 'Install the complete marketing trio: callout, contact, and lead magnet.',
  },
  {
    name: 'meda-marketing-callout',
    title: 'Marketing Callout',
    description: 'Install the campaign callout block for launch CTAs and highlighted messages.',
  },
  {
    name: 'meda-marketing-contact',
    title: 'Marketing Contact',
    description: 'Install the contact section with form, office, and direct-contact slots.',
  },
  {
    name: 'meda-marketing-lead-magnet',
    title: 'Marketing Lead Magnet',
    description: 'Install the lead capture block with featured/sidebar layouts and modal form.',
  },
] as const;

const SITE_SECTION_TO_APP = {
  overview: 'overview',
  install: 'overview',
  shell: 'shell',
  components: 'components',
  registry: 'registry',
} as const;

const SITE_APP_TO_SECTION = {
  overview: 'overview',
  shell: 'shell',
  components: 'components',
  registry: 'registry',
} as const;

type SiteSectionId = keyof typeof SITE_SECTION_TO_APP;
type SiteAppId = keyof typeof SITE_APP_TO_SECTION;

const SITE_WORKSPACE: WorkspaceDefinition = {
  id: 'meda-ui',
  name: 'Meda UI',
  icon: <MedalSocialMark className="site-workspace-mark" />,
};

const SITE_APPS: AppDefinition[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'shell', label: 'Shell', icon: LayoutDashboard },
  { id: 'components', label: 'Components', icon: Sparkles },
  { id: 'registry', label: 'Registry', icon: FolderOpen },
];

const SITE_RAIL_ITEMS: ComponentProps<typeof IconRail>['mainItems'] = SITE_APPS.map((app) => ({
  id: app.id,
  label: app.label,
  icon: app.icon,
  to: `#${SITE_APP_TO_SECTION[app.id as SiteAppId]}`,
}));

const SITE_CONTEXT_MODULE: ContextModule = {
  id: 'meda-docs',
  label: 'Meda workspace',
  description: 'Docs, live primitives, and install paths',
  items: [
    { id: 'overview', label: 'Overview', icon: BookOpen, to: '#overview', shortcut: '1' },
    { id: 'install', label: 'Install', icon: Zap, to: '#install', shortcut: '2' },
    { id: 'shell', label: 'Shell v2', icon: LayoutDashboard, to: '#shell', shortcut: '3' },
    { id: 'components', label: 'Components', icon: Sparkles, to: '#components', shortcut: '4' },
    { id: 'registry', label: 'Registry', icon: FolderOpen, to: '#registry', shortcut: '5' },
  ],
};

const SITE_PANEL_VIEWS: PanelView[] = [
  {
    id: 'usage',
    label: 'Usage',
    icon: Zap,
    render: () => (
      <div className="site-panel-stack">
        <div>
          <p className="site-panel-kicker">Package</p>
          <h3 className="site-panel-title">@medalsocial/meda</h3>
          <p className="site-panel-copy">
            Install the compiled package when you want Medal to own upgrades and API evolution.
          </p>
        </div>
        <pre className="codeblock codeblock--inline">pnpm add @medalsocial/meda</pre>
        <a
          className="site-panel-link"
          href="https://www.npmjs.com/package/@medalsocial/meda"
          target="_blank"
          rel="noreferrer"
        >
          npm package
        </a>
      </div>
    ),
  },
  {
    id: 'registry',
    label: 'Registry',
    icon: FolderOpen,
    render: () => (
      <div className="site-panel-stack">
        <div>
          <p className="site-panel-kicker">Source install</p>
          <h3 className="site-panel-title">shadcn-compatible registry</h3>
          <p className="site-panel-copy">
            Copy the shell source into a product repo when the consuming app needs direct ownership.
          </p>
        </div>
        {registryItems.map((item) => (
          <a className="site-panel-link" href={`#registry`} key={item.name}>
            {item.name}
          </a>
        ))}
      </div>
    ),
  },
  {
    id: 'ai',
    label: 'Links',
    icon: Sparkles,
    render: () => (
      <div className="site-panel-stack">
        <div>
          <p className="site-panel-kicker">Shortcuts</p>
          <h3 className="site-panel-title">Meda resources</h3>
          <p className="site-panel-copy">
            Jump to package docs, source, and install surfaces without leaving the mobile shell.
          </p>
        </div>
        <a className="site-panel-link" href="/storybook/">
          Storybook
        </a>
        <a
          className="site-panel-link"
          href="https://github.com/Medal-Social/meda"
          target="_blank"
          rel="noreferrer"
        >
          GitHub repository
        </a>
        <a
          className="site-panel-link"
          href="https://www.npmjs.com/package/@medalsocial/meda"
          target="_blank"
          rel="noreferrer"
        >
          npm package
        </a>
      </div>
    ),
  },
];

const SITE_MOBILE_NAV: ComponentProps<typeof MobileBottomNav>['items'] = [
  { id: 'menu', label: 'Menu', icon: LayoutDashboard, opens: 'menu-drawer' },
  { id: 'module', label: 'Docs', icon: BookOpen, opens: 'module-drawer' },
  { id: 'panels', label: 'Panel', icon: PanelRight, opens: 'panels-drawer' },
  { id: 'ai', label: 'Links', icon: Sparkles, opens: 'ai-drawer' },
];

function isSiteSection(value: string): value is SiteSectionId {
  return value in SITE_SECTION_TO_APP;
}

function getInitialSiteSection(): SiteSectionId {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.replace('#', '');
  return isSiteSection(hash) ? hash : 'overview';
}

function getInitialSiteApp(): SiteAppId {
  return SITE_SECTION_TO_APP[getInitialSiteSection()] as SiteAppId;
}

function scrollSiteSectionIntoView(sectionId: SiteSectionId) {
  const section = document.getElementById(sectionId);
  const scroller = section?.closest<HTMLElement>('.site-main');
  if (!section || !scroller) return;

  const sectionRect = section.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  scroller.scrollTo({
    top: scroller.scrollTop + sectionRect.top - scrollerRect.top,
    left: 0,
    behavior: 'auto',
  });
  window.scrollTo(0, 0);
}

/* ─────────────────────────────────────────────────────────────────────────── *
 * App root
 * ─────────────────────────────────────────────────────────────────────────── */

export function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <MedaShellProvider
        workspace={SITE_WORKSPACE}
        workspaces={[SITE_WORKSPACE]}
        apps={SITE_APPS}
        defaultActiveApp={getInitialSiteApp()}
        panelViews={SITE_PANEL_VIEWS}
        mobileBottomNav={SITE_MOBILE_NAV}
        themeAdapter="default"
      >
        <SiteWorkspace />
      </MedaShellProvider>
    </div>
  );
}

function SiteWorkspace() {
  const { activeAppId, setActiveApp } = useMedaShell();
  const [activeSection, setActiveSection] = useState<SiteSectionId>(getInitialSiteSection);
  const previousActiveAppRef = useRef(activeAppId);

  const navigateToSection = (sectionId: string, replace = false) => {
    if (!isSiteSection(sectionId)) return;
    setActiveSection(sectionId);
    setActiveApp(SITE_SECTION_TO_APP[sectionId]);
    const nextHash = `#${sectionId}`;
    if (window.location.hash !== nextHash) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method](null, '', nextHash);
    }
    scrollSiteSectionIntoView(sectionId);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const sectionId = getInitialSiteSection();
      setActiveSection(sectionId);
      setActiveApp(SITE_SECTION_TO_APP[sectionId]);
      window.requestAnimationFrame(() => scrollSiteSectionIntoView(sectionId));
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [setActiveApp]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      scrollSiteSectionIntoView(getInitialSiteSection());
    });
  }, []);

  useEffect(() => {
    if (previousActiveAppRef.current === activeAppId) return;
    previousActiveAppRef.current = activeAppId;
    const sectionId = SITE_APP_TO_SECTION[activeAppId as SiteAppId];
    if (SITE_SECTION_TO_APP[activeSection] === activeAppId) return;
    if (!sectionId || sectionId === activeSection) return;
    setActiveSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
    scrollSiteSectionIntoView(sectionId);
  }, [activeAppId, activeSection]);

  return (
    <>
      <CommandPalette />
      <AppShell className="site-app-shell">
        <ShellHeader
          className="site-shell-header"
          globalActions={
            <div className="site-header-actions">
              <a className="site-header-link" href="/storybook/">
                Storybook
              </a>
              <a
                className="site-header-link"
                href="https://github.com/Medal-Social/meda"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          }
        />
        <MobileHeader
          globalActions={
            <a className="site-header-link" href="/storybook/">
              Storybook
            </a>
          }
        />
        <AppShellBody className="site-app-body">
          <IconRail
            mainItems={SITE_RAIL_ITEMS}
            activeId={SITE_SECTION_TO_APP[activeSection]}
            utilityItems={[
              { id: 'storybook', label: 'Storybook', icon: BookOpen, to: '/storybook/' },
              {
                id: 'github',
                label: 'GitHub',
                icon: FileText,
                to: 'https://github.com/Medal-Social/meda',
              },
            ]}
            renderLink={({ item, isActive, className, children }) => {
              const sectionId = item.to.startsWith('#') ? item.to.slice(1) : null;
              const isExternal = item.to.startsWith('http');
              return (
                <a
                  key={item.id}
                  href={item.to}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={className}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  onClick={
                    sectionId
                      ? (event) => {
                          event.preventDefault();
                          navigateToSection(sectionId);
                        }
                      : undefined
                  }
                >
                  {children}
                </a>
              );
            }}
            footer={<MedalSocialMark className="site-rail-mark" />}
          />
          <ContextRail
            appId={activeAppId}
            module={SITE_CONTEXT_MODULE}
            activeItemId={activeSection}
            renderLink={({ item, isActive, className, children }) => (
              <a
                key={item.id}
                href={item.to}
                data-active={isActive}
                className={className}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToSection(item.id);
                }}
              >
                {children}
              </a>
            )}
            className="site-context-rail"
          />
          <ShellMain layout="fullbleed" className="site-main">
            <div className="site-workspace">
              <section id="overview" className="hero">
                <span className="badge">
                  <span>v1.0.0-rc.1</span>
                  <span>Apache-2.0</span>
                  <span>React 19</span>
                </span>
                <h1>
                  <em>The shell that runs Medal.</em>
                </h1>
                <p className="lead">
                  Production-tested React primitives for app shells, navigation, panels, command
                  palettes, and workbench layouts. Ship it as an npm package, or copy source into
                  your project via the shadcn-compatible registry.
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
                    View on GitHub
                  </a>
                </div>
              </section>

              <section id="install" className="section">
                <div className="section-header">
                  <div className="eyebrow">Install</div>
                  <h2 className="section-title">Two ways to use meda</h2>
                  <p className="section-sub">
                    Pick the ownership model that fits your team. Both paths use the same Meda shell
                    primitives and tokens.
                  </p>
                </div>
                <div className="install-grid">
                  <div className="install-card">
                    <div className="install-card-label">
                      <span>NPM PACKAGE</span>
                    </div>
                    <h3>Install as a dependency</h3>
                    <p>
                      Compiled <code>dist/</code> ships to npm, upgrades flow through your lockfile,
                      and types are included.
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
                      <span>SHADCN REGISTRY</span>
                    </div>
                    <h3>Copy source into your repo</h3>
                    <p>
                      shadcn CLI copies the source files into your project so you can own and adapt
                      the internals.
                    </p>
                    <pre className="codeblock">
                      <span className="prompt">$ </span>npx shadcn add \{'\n'}
                      {'  '}https://meda.medalsocial.com/r/meda-shell.json
                    </pre>
                  </div>
                </div>
              </section>

              <section id="shell" className="section">
                <div className="section-header section-header--left">
                  <div className="eyebrow">Shell v2</div>
                  <h2 className="section-title">Full shell live demo</h2>
                  <p className="section-sub">
                    <code>MedaShellProvider</code> wraps <code>AppShell</code> and its regions. Use
                    the rail, panel toggle, and command palette the same way a product app would.
                  </p>
                </div>
                <ShellV2Demo />
              </section>

              <section id="components" className="section">
                <div className="section-header section-header--left">
                  <div className="eyebrow">Components</div>
                  <h2 className="section-title">Primitive workbench</h2>
                  <p className="section-sub">
                    Activity, chat, and inspector primitives rendered as working Meda surfaces.
                  </p>
                </div>

                <TimelineDemo />
                <ChatDemo />
                <PanelDemo />
                <MarketingDemo />
              </section>

              <section id="registry" className="section section--subtle">
                <div className="section-header section-header--left">
                  <div className="eyebrow">Shadcn registry</div>
                  <h2 className="section-title">Composable registry items</h2>
                  <p className="section-sub">
                    shadcn-compatible registry items, each independently installable. The full
                    component library above is always available via the npm package.
                  </p>
                </div>
                <div className="registry-grid">
                  {registryItems.map((item) => (
                    <div className="registry-card" key={item.name}>
                      <div className="registry-name">@meda / {item.name}</div>
                      <h3 className="registry-title">{item.title}</h3>
                      <p className="registry-desc">{item.description}</p>
                      <pre className="registry-cmd">{`npx shadcn add \\
  .../r/${item.name}.json`}</pre>
                    </div>
                  ))}
                </div>
              </section>

              <SiteFooter />
            </div>
          </ShellMain>
          <RightPanel panelViews={SITE_PANEL_VIEWS} defaultView="usage" />
        </AppShellBody>
        <MobileDrawers
          menuItems={SITE_RAIL_ITEMS}
          module={SITE_CONTEXT_MODULE}
          panelViews={SITE_PANEL_VIEWS}
        />
        <MobileBottomNav items={SITE_MOBILE_NAV} />
      </AppShell>
    </>
  );
}

function SiteFooter() {
  return (
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
      <ContextRail appId="inbox" module={module} activeItemId={id} />
      <ShellMain><YourPage /></ShellMain>
      <RightPanel />
    </AppShellBody>
    {/* Mobile */}
    <MobileHeader />
    <MobileDrawers menuItems={railItems} module={module} panelViews={panels} />
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
                appId="inbox"
                module={CONTEXT_MODULE}
                activeItemId={activeItem}
                renderLink={({ item, isActive, className, children }) => (
                  <button
                    key={item.id}
                    type="button"
                    data-active={isActive}
                    className={className}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {children}
                  </button>
                )}
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
              menuItems={ICON_RAIL_ITEMS}
              module={CONTEXT_MODULE}
              panelViews={PANEL_VIEWS}
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

function MarketingDemoForm({ label = 'Request access' }: { label?: string }) {
  return (
    <form aria-label={label} className="space-y-3">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Work email
        <input
          className="mt-2 h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
          placeholder="you@company.com"
          type="email"
        />
      </label>
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
        type="button"
      >
        Submit
      </button>
    </form>
  );
}

function MarketingDemo() {
  return (
    <>
      <ComponentDoc
        name="MarketingCallout"
        description="Campaign callout block for highlighted messages, launch prompts, and conversion CTAs. Supports full-width band and compact card variants."
        registryItem="meda-marketing-callout"
        code={`import { MarketingCallout } from '@medalsocial/meda/marketing';

<MarketingCallout
  eyebrow="Launch campaign"
  title="Turn every product update into pipeline"
  description="A focused callout block for landing pages and launch notes."
  ctas={[
    { label: 'Book demo', href: '/demo' },
    { label: 'Read playbook', href: '/playbook', variant: 'secondary' },
  ]}
/>`}
      >
        <div className="preview-canvas preview-canvas--flush">
          <MarketingCallout
            eyebrow="Launch campaign"
            title="Turn every product update into pipeline"
            description="A focused callout block for landing pages, launch notes, and campaign moments that need clear next steps."
            ctas={[
              { label: 'Book demo', href: '#demo' },
              { label: 'Read playbook', href: '#playbook', variant: 'secondary' },
            ]}
          />
        </div>
      </ComponentDoc>

      <ComponentDoc
        name="MarketingContact"
        description="Contact section with an intro, form slot, office details, and direct-contact card. Consumers bring their own form implementation."
        registryItem="meda-marketing-contact"
        code={`import { MarketingContact } from '@medalsocial/meda/marketing';

<MarketingContact
  intro="Give buyers a direct path to the team."
  form={<YourForm />}
  office={{ email: 'hello@medalsocial.com' }}
  contactPerson={{ name: 'Ali', role: 'Marketing lead' }}
/>`}
      >
        <div className="preview-canvas preview-canvas--flush">
          <MarketingContact
            intro="Give buyers a direct path to the team behind the campaign."
            form={<MarketingDemoForm />}
            office={{
              title: 'Oslo office',
              address: 'Torggata 1, 0181 Oslo',
              email: 'hello@medalsocial.com',
              phone: '+47 22 00 00 00',
              hours: 'Mon-Fri, 09:00-17:00',
            }}
            contactPerson={{
              title: 'Direct contact',
              name: 'Ali',
              role: 'Marketing lead',
              description: 'Helps teams package launches into crisp, trackable campaigns.',
              email: 'ali@medalsocial.com',
              phone: '+47 99 00 00 00',
            }}
          />
        </div>
      </ComponentDoc>

      <ComponentDoc
        name="MarketingLeadMagnet"
        description="Lead capture block with featured/sidebar layouts and an accessible modal form trigger. Consumers pass their own form slot."
        registryItem="meda-marketing-lead-magnet"
        code={`import { MarketingLeadMagnet } from '@medalsocial/meda/marketing';

<MarketingLeadMagnet
  title="Get the launch checklist"
  benefits={['Messaging outline', 'QA pass', 'Analytics checklist']}
  form={<YourForm />}
/>`}
      >
        <div className="preview-canvas">
          <MarketingLeadMagnet
            title="Get the launch checklist"
            description="A practical campaign checklist for turning product updates into repeatable launch systems."
            benefits={['Messaging outline', 'QA pass', 'Analytics checklist']}
            buttonText="Download checklist"
            formTitle="Send me the checklist"
            form={<MarketingDemoForm label="Lead magnet form" />}
            image={
              <div className="flex aspect-[4/3] min-h-48 items-center justify-center bg-[var(--muted)] p-8 text-center text-sm font-semibold text-[var(--muted-foreground)]">
                Launch checklist preview
              </div>
            }
          />
        </div>
      </ComponentDoc>
    </>
  );
}
