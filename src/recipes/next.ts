export interface MedaRecipeFile {
  path: string;
  target: string;
  type: 'registry:block' | 'registry:component' | 'registry:hook' | 'registry:lib';
  content: string;
}

export interface MedaRecipe {
  name: string;
  title: string;
  description: string;
  dependencies: string[];
  peerDependencies: string[];
  cssVars: string[];
  files: MedaRecipeFile[];
  accessibility: string[];
}

export const nextAppShellRecipe = {
  name: 'meda-next-app-shell',
  title: 'Meda Next AppShell',
  description:
    'Copyable Next.js App Router shell adapter with next/link routing, route-owned panel views, and auth controls.',
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
  type IconRailItem,
  type PanelView,
  type WorkspaceDefinition,
} from '@medalsocial/meda/shell'

export function MedaNextWorkspaceShell({
  workspace,
  apps,
  iconItems,
  activeIconId,
  panelViews = [],
  defaultPanelView,
  children,
}: {
  workspace: WorkspaceDefinition
  apps: AppDefinition[]
  iconItems: IconRailItem[]
  activeIconId?: string
  panelViews?: PanelView[]
  defaultPanelView?: string
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
    'Auth provider buttons keep the visible provider affordance separate from the accessible button name.',
    'Route-owned panel views should expose headings inside their rendered panel content.',
    'Reduced-motion behavior remains delegated to Meda shell motion tokens.',
  ],
} satisfies MedaRecipe;

export const nextRecipes = [nextAppShellRecipe] satisfies MedaRecipe[];
