# @medalsocial/meda

Shared Meda UI shell/runtime package.

Current scope:
- shell layout primitives
- shell navigation and rail renderers
- shell header and tab chrome
- shell state runtime
- shell layout and route utilities

Non-goals for this package:
- duplicating the full shadcn primitive layer
- Picasso-specific route config, workspace data, or panel content
- router-specific runtime assumptions

## Import Surface

Primary root import:

```ts
import {
  NavigationArea,
  ShellAppRail,
  ShellDesktopPanelDock,
  ShellFrame,
  ShellHeaderFrame,
  ShellModuleNav,
  ShellPanelRail,
  ShellScrollableContent,
  ShellStateProvider,
  ShellTabBar,
  WorkbenchLayout,
} from '@medalsocial/meda'
```

The root package is the curated public API. It is the default import surface for app consumers.

Shell subpath:

```ts
import { ShellFrame, ShellStateProvider } from '@medalsocial/meda/shell'
```

The `@medalsocial/meda/shell` subpath is broader. Use it when you intentionally need lower-level shell helpers that are not part of the primary root contract yet.

## Stable Root Surface

Root exports currently include:
- shell chrome: `ShellFrame`, `ShellHeaderFrame`, `ShellPanelToggle`, `NavigationArea`
- shell navigation: `ShellAppRail`, `ShellModuleNav`, `ShellPanelRail`, `ShellTabBar`
- shell layout/runtime: `ShellDesktopPanelDock`, `ShellScrollableContent`, `WorkbenchLayout`
- shell state: `ShellStateProvider`, `useShellState`
- shared contracts: `ShellModuleDefinition`, `ShellPanelDefinition`, `ShellRailItem`, `ShellTab`, `ShellViewDefinition`
- shared utilities: route-handle helpers, panel helpers, layout helpers, section-command builder, shortcut-map builder

Lower-level shell internals remain available from `@medalsocial/meda/shell`.

## Minimal Consumer Shape

Typical consumer setup:

```ts
import {
  ShellFrame,
  ShellHeaderFrame,
  ShellStateProvider,
  ShellTabBar,
  type ShellModuleDefinition,
} from '@medalsocial/meda'
```

Then the host app provides:
- router integration through `renderLink` callbacks and search-param adapters
- module definitions and panel registries
- workspace/business state
- app-specific menus and content renderers

## Recipes

### 1. Define app modules

```ts
import { Home, Package } from 'lucide-react'
import type { ShellModuleDefinition } from '@medalsocial/meda'

export const modules: Record<string, ShellModuleDefinition> = {
  lab: {
    id: 'lab',
    label: 'Labs',
    description: 'Hardware R&D workspace',
    items: [
      {
        to: '/lab',
        label: 'Overview',
        description: 'Program status and entry points',
        icon: Home,
        shortcut: '1',
      },
      {
        to: '/lab/products',
        label: 'Products',
        description: 'Every form factor and BOM',
        icon: Package,
        shortcut: '2',
      },
    ],
    headerTabs: [
      { id: 'overview', to: '/lab', label: 'Overview' },
      { id: 'products', to: '/lab/products', label: 'Products' },
    ],
  },
}
```

### 2. Connect shell state to host routing

```ts
import { ShellStateProvider } from '@medalsocial/meda'
import { useSearchParams } from 'react-router'

export function AppShellState({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <ShellStateProvider
      adapter={{
        searchParams,
        setSearchParams: (updater) => {
          setSearchParams((current) => updater(current))
        },
      }}
      initialActiveRail="lab"
      selectionQueryParam="product"
      sidePanelWidthStorageKey="my-app.side-panel.width"
    >
      {children}
    </ShellStateProvider>
  )
}
```

### 3. Render router-aware tabs

```ts
import { ShellTabBar, type ShellTab } from '@medalsocial/meda'
import Link from 'next/link'

export function AppTabs({ tabs, activeTab }: { tabs: ShellTab[]; activeTab?: string }) {
  return (
    <ShellTabBar
      tabs={tabs}
      activeTab={activeTab}
      ariaLabel="Workspace tabs"
      renderLink={({ children, className, tab, isActive }) => (
        <Link
          key={tab.id}
          href={tab.to ?? '#'}
          aria-current={isActive ? 'page' : undefined}
          className={className}
        >
          {children}
        </Link>
      )}
    />
  )
}
```

### 4. Compose the shell frame

```tsx
<ShellFrame
  header={
    <ShellHeaderFrame
      left={<WorkspaceMenu />}
      center={<AppTabs tabs={tabs} activeTab={activeTab} />}
      right={<HeaderActions />}
    />
  }
  navigation={
    <NavigationArea>
      <AppRail />
      <SectionSidebar />
    </NavigationArea>
  }
  content={
    <ShellScrollableContent
      layout="workspace"
      maxWidth={1120}
      desktopDockOffset={panelOpen ? 392 : 0}
    >
      <Outlet />
    </ShellScrollableContent>
  }
  desktopDock={
    panelOpen ? (
      <ShellDesktopPanelDock
        defaultView={activeView}
        panelOpen
        width={panelWidth}
        onWidthChange={setPanelWidth}
        renderPanel={({ defaultView, className }) => (
          <MyPanel defaultView={defaultView} className={className} />
        )}
      />
    ) : null
  }
/>
```

### 5. Build section commands

```ts
import { buildShellSectionCommands } from '@medalsocial/meda'

const commands = [
  ...buildShellSectionCommands(activeModule),
  { id: 'settings', label: 'Settings', to: '/settings', icon: Settings, group: 'Global' },
]
```

### 6. Resolve route-provided shell metadata

```ts
import {
  getShellActionsFromMatches,
  getShellContentLayoutFromMatches,
  getShellPanelViewsFromMatches,
  getShellTabsFromMatches,
} from '@medalsocial/meda'

const contentLayout = getShellContentLayoutFromMatches(matches)
const shellTabs = getShellTabsFromMatches(matches, pathname)
const shellActions = getShellActionsFromMatches(matches, pathname)
const panelViewIds = getShellPanelViewsFromMatches(matches)
```

## Host Responsibilities

Consumers own:
- routing and link rendering
- module definitions
- panel definitions and renderers
- workspace/business state
- app-specific header/workspace menus

Meda owns:
- reusable shell chrome and runtime
- generic shell state persistence and query-param wiring through adapters
- layout math and route-handle helpers

## Router Guidance

Meda should stay React-first and router-agnostic.

- React Router apps: pass `Link`/`NavLink` through render props and connect `useSearchParams` to `ShellStateProvider`
- Next.js apps: pass `next/link` wrappers and a host search-param adapter
- TanStack Router apps: pass router link wrappers and route/search adapters from the host

The package should not import app-router internals directly.

## Current Verification

The package is currently verified by:
- package-level unit tests in `software/meda/src/shell/*.test.tsx`
- Picasso dashboard consuming the package in `software/dashboard`
- a separate consumer fixture in `software/meda-fixture`
