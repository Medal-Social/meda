# Story Authoring Guide

This guide is the standard for every `*.stories.tsx` file in `@medalsocial/meda`. The lint script `pnpm check:stories` enforces it.

## Philosophy

One story per visually distinct shape. Everything else is a Storybook control.

A story exists if and only if it shows you something you cannot reach by toggling controls in Storybook's UI. "What does this look like with three workspaces vs one?" is a control. "What does the empty state look like?" is a story only if the empty state has bespoke UI.

## Story budget

- Soft cap: 3 stories per file. Above this, the lint script warns.
- Hard cap: 5 stories per file. Above this, the lint script fails.
- AppShell is the one exception (3 variants × 3 viewports — but still 3 story exports).

## Mode budget (Chromatic)

| Category                         | Modes shot                  | Snapshots/story |
|----------------------------------|-----------------------------|-----------------|
| AppShell variants                | desktop, ipad, mobile       | 3               |
| Marketing surfaces               | desktop, mobile             | 2               |
| Everything else                  | desktop                     | 1               |
| Animation-only                   | none (`disableSnapshot`)    | 0               |

Set per story:

```tsx
export const Workspace: Story = {
  parameters: {
    chromatic: { modes: { desktop: { viewport: 1280 }, ipad: { viewport: 768 }, mobile: { viewport: 390 } } },
  },
  // ...
};
```

## Theme is not a Chromatic mode

The toolbar toggle (`withThemeByDataAttribute`) covers human verification. Do not write `DarkTheme` stories. Do not set `parameters.themes.themeOverride`. The lint script rejects both.

## Ignore policy

Three tiers, smallest scope wins.

1. **`<div data-chromatic="ignore">`** wrapping only the moving subtree (preferred):

   ```tsx
   <span data-chromatic="ignore">{ms}ms</span>
   ```

2. **`parameters.chromatic.ignoreSelectors`** at meta level when the same moving region appears across many stories of the component.

3. **`parameters.chromatic.disableSnapshot: true`** when the entire component IS the animation (`VoiceOrb`, `VoiceLevel` Bars/Wave).

For time-based components, prefer pinning the `now` prop over ignoring the region. Only reach for ignores when pinning is impossible.

## Anti-patterns

| Don't                                               | Do                                                                |
|-----------------------------------------------------|-------------------------------------------------------------------|
| `export const DarkTheme: Story = { ... }`           | Use the toolbar toggle. Delete the story.                         |
| `export const MobileCombined: Story = { ... }`      | Use Chromatic mobile mode on the canonical story.                 |
| `export const Empty: Story = { args: { items: [] } }` if there's no special empty UI | Default story with `items: []` control. Delete the story. |
| Hand-composing `<MobileHeader>` in a consumer       | Use `<AppShell variant="...">`. Mobile chrome is internal.        |
| Six stories on one component                        | Collapse arg-variants into controls. Restructure into AppShell variants if it really has six visual modes. |

## AppShell composition

Consumers compose one `<AppShell>` with a config:

```tsx
<AppShell
  variant="workspace"
  iconRail={{ mainItems, utilityItems }}
  contextRail={{ module }}
  rightPanel={{ panelViews, defaultView: 'inspector' }}
  globalActions={<NewButton />}
>
  {children}
</AppShell>
```

The variant decides which chrome renders. The viewport decides whether desktop or mobile chrome is used internally. Consumers do not import `MobileHeader`, `MobileBottomNav`, or `MobileDrawers` directly — those are no longer exported.
