---
'@medalsocial/meda': major
---

Storybook cleanup and AppShell unification.

**Breaking changes:**
- `<AppShell>` now requires a `variant` prop: `"auth" | "workspace" | "chat"`. Composition is config-driven via `iconRail`, `contextRail`, `rightPanel`, `globalActions`, and `auth` props.
- `MobileHeader`, `MobileBottomNav`, `MobileDrawers`, `ShellAuthFrame`, and `ShellAuthThemeToggle` are removed. Their behavior is now internal to `<AppShell variant="auth">` and `<AppShell variant="workspace">`. The viewport switch is automatic.

**New:**
- Chromatic viewport modes (`desktop`, `ipad`, `mobile`) configured in `.storybook/preview.ts`.
- `pnpm check:stories` lint script enforces story authoring conventions (banned export names, banned parameter shapes, story budget per file).
- `docs/STORIES.md` authoring guide.

**Migration:**
Replace hand-composed shells with the new variant API:

```tsx
<AppShell>
  <ShellHeader />
  <MobileHeader />
  <AppShellBody>
    <IconRail mainItems={items} />
    <ContextRail module={module} />
    <ShellMain>{children}</ShellMain>
    <RightPanel panelViews={views} />
  </AppShellBody>
  <MobileBottomNav />
  <MobileDrawers menuItems={items} module={module} panelViews={views} />
</AppShell>
```

```tsx
<AppShell
  variant="workspace"
  iconRail={{ mainItems: items }}
  contextRail={{ appId: 'inbox', module }}
  rightPanel={{ panelViews: views }}
>
  {children}
</AppShell>
```
