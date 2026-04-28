---
'@medalsocial/meda': minor
---

Storybook cleanup and AppShell unification. The package is on `1.0.0-rc.1` with no real-world consumers yet, so the API reshape below ships as a `minor` to land before `1.0.0` rather than as a `major`. Treat this as part of the original `1.0.0` API surface — the components removed below were never depended on by any external app.

**API surface changes (rolled into the `1.0.0` release):**
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
