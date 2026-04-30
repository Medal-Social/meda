export const nextAppShellRecipe = {
    name: 'meda-next-app-shell',
    title: 'Meda Next AppShell',
    description: 'Copyable Next.js App Router shell adapter with next/link routing, route-owned panel views, and auth controls.',
    dependencies: ['@medalsocial/meda', 'lucide-react'],
    peerDependencies: ['next', 'react', 'react-dom'],
    cssVars: ['@medalsocial/meda/styles.css'],
    files: [
        {
            path: 'registry/meda/meda-next-app-shell/meda-next-app-shell.tsx',
            target: 'components/meda/meda-next-app-shell.tsx',
            type: 'registry:block',
            content: `\
'use client'

import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import {
  AppShell,
  AuthError,
  AuthNotice,
  AuthOneTapSlot,
  AuthProviderButton,
  AuthProviderList,
  MedaShellProvider,
  PanelViewsProvider,
  type AppDefinition,
  type AppShellAppTabsConfig,
  type IconRailItem,
  type PanelView,
  type WorkspaceDefinition,
  type WorkspaceMenuItem,
} from '@medalsocial/meda/shell'

export function MedaNextWorkspaceShell({
  workspace,
  apps,
  iconItems,
  activeIconId,
  panelViews = [],
  defaultPanelView,
  appTabs,
  headerCenter,
  banners,
  workspaceMenuItems,
  workspaceMenuFooter,
  children,
}: {
  workspace: WorkspaceDefinition
  apps: AppDefinition[]
  iconItems: IconRailItem[]
  activeIconId?: string
  panelViews?: PanelView[]
  defaultPanelView?: string
  appTabs?: AppShellAppTabsConfig
  headerCenter?: ReactNode
  banners?: ReactNode
  workspaceMenuItems?: WorkspaceMenuItem[]
  workspaceMenuFooter?: ReactNode
  children: ReactNode
}) {
  return (
    <MedaShellProvider workspace={workspace} apps={apps}>
      <AppShell
        variant="workspace"
        iconRail={{
          mainItems: iconItems,
          activeId: activeIconId,
          renderLink: ({ item, linkProps }) => (
            <Link {...linkProps} href={item.to} prefetch />
          ),
        }}
        appTabs={
          appTabs ?? {
            renderLink: ({ app, linkProps }) =>
              app.to ? <Link {...linkProps} href={app.to} prefetch /> : <a {...linkProps} />,
          }
        }
        headerCenter={headerCenter}
        banners={banners}
        workspace={{ menuItems: workspaceMenuItems, menuFooter: workspaceMenuFooter }}
        rightPanel={{ panelViews, defaultView: defaultPanelView }}
      >
        <PanelViewsProvider views={panelViews} defaultView={defaultPanelView}>
          {children}
        </PanelViewsProvider>
      </AppShell>
    </MedaShellProvider>
  )
}

export function MedaNextAuthShell({
  brandName,
  brandMark,
  appName,
  tagline,
  preview,
  error,
  notice,
  onGoogleSignIn,
}: {
  brandName: ReactNode
  brandMark?: ReactNode
  appName?: ReactNode
  tagline?: ReactNode
  preview?: ReactNode
  error?: ReactNode
  notice?: ReactNode
  onGoogleSignIn: ComponentProps<typeof AuthProviderButton>['onClick']
}) {
  return (
    <MedaShellProvider workspace={{ id: 'auth', name: 'Auth', icon: brandMark }} apps={[]}>
      <AppShell
        variant="auth"
        branding={{ brandName, brandMark, appName, tagline }}
        preview={preview}
      >
        <AuthProviderList>
          <AuthProviderButton
            provider="google"
            label="Continue with Google"
            onClick={onGoogleSignIn}
          />
        </AuthProviderList>
        <AuthNotice>{notice}</AuthNotice>
        <AuthError>{error}</AuthError>
        <AuthOneTapSlot />
      </AppShell>
    </MedaShellProvider>
  )
}
`,
        },
    ],
    accessibility: [
        'Every drawer and panel keeps its accessible name from AppShell and RightPanel.',
        'Custom link renderers must forward all linkProps to preserve aria-current, labels, handlers, and className.',
        'Workspace menu items render in desktop and mobile chrome, so critical actions stay reachable across viewports.',
        'Auth provider buttons keep the visible provider affordance separate from the accessible button name.',
        'Route-owned panel views should expose headings inside their rendered panel content.',
        'Reduced-motion behavior remains delegated to Meda shell motion tokens.',
    ],
    composition: [
        'MedaShellProvider owns workspace and app context for the copied shell adapter.',
        'AppShell receives route-owned rightPanel views on first render to avoid delayed panel UI.',
        'AppShellWorkspace mounts CommandPalette internally; route children can call useCommands without an extra shell-level mount.',
        'headerCenter and banners keep route-level chrome in the shell band instead of inside the main pane.',
        'PanelViewsProvider wraps children with the same panelViews and defaultPanelView for nested route registrations.',
        'renderLink composes Next Link by forwarding Meda linkProps before setting framework-specific props.',
    ],
};
export const nextRecipes = [nextAppShellRecipe];
