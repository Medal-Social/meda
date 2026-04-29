---
"@medalsocial/meda": minor
---

`<AppShell variant="workspace">` now accepts a `workspace` config that lets consumers replace the WorkspaceSwitcher's package-default dropdown items with their own. Previously the "Manage workspaces / Settings / Profile / Sign out" entries were hardcoded inside `WorkspaceSwitcher` with no `onClick` or `href`, so they did nothing when clicked — a blocker for any real adopter.

```tsx
<AppShell
  variant="workspace"
  workspace={{
    menuItems: [
      { id: 'settings', label: 'Settings', href: '/settings/users' },
      { id: 'profile',  label: 'Profile',  href: '/identity' },
      { id: 'sign-out', label: 'Sign out', onClick: () => signOut(), variant: 'destructive' },
    ],
    menuFooter: <CustomBottomSlot />,
  }}
  iconRail={...}
>
```

The new `WorkspaceMenuItem` shape supports `href`, `onClick`, optional `icon`, optional `separatorAfter`, and a `variant: 'default' | 'destructive'` tone hint. When `menuItems` is omitted the package-default items render unchanged (1.x behavior), so this is fully additive and non-breaking.

The theme toggle is preserved automatically — meda still inserts it between the items and the footer so consumers don't need to reimplement theme cycling.

`WorkspaceSwitcherProps.menuFooter` is the preferred name; `workspaceMenuFooter` is kept as a deprecated alias for backwards compatibility.
