/**
 * Typed token registry mirroring src/styles/tokens.css.
 *
 * The CSS file remains the runtime source of truth; this registry gives
 * Storybook docs a stable, typed list to render.
 */

export type RampStop =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export const colorPrimitives = {
  brand: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  neutral: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  error: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  info: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  success: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  warning: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
} as const satisfies Record<string, readonly RampStop[]>;

export type SemanticToken = {
  name: string;
  group: 'shape' | 'status' | 'sidebar' | 'chart' | 'text';
  description: string;
};

export const semanticTokens: SemanticToken[] = [
  { name: 'background', group: 'shape', description: 'Default page canvas.' },
  { name: 'foreground', group: 'shape', description: 'Default text on background.' },
  { name: 'card', group: 'shape', description: 'Surface for elevated content.' },
  { name: 'card-foreground', group: 'shape', description: 'Text on card surfaces.' },
  { name: 'popover', group: 'shape', description: 'Floating menu surface.' },
  { name: 'popover-foreground', group: 'shape', description: 'Text on popovers.' },
  { name: 'primary', group: 'shape', description: 'Primary action and brand emphasis.' },
  { name: 'primary-foreground', group: 'shape', description: 'Text on primary surfaces.' },
  { name: 'secondary', group: 'shape', description: 'Secondary action surface.' },
  { name: 'secondary-foreground', group: 'shape', description: 'Text on secondary surfaces.' },
  { name: 'muted', group: 'shape', description: 'Low-emphasis surface.' },
  { name: 'muted-foreground', group: 'shape', description: 'Low-emphasis text.' },
  { name: 'accent', group: 'shape', description: 'Hover and focus accent surface.' },
  { name: 'accent-foreground', group: 'shape', description: 'Text on accent surfaces.' },
  { name: 'destructive', group: 'shape', description: 'Destructive action emphasis.' },
  { name: 'destructive-foreground', group: 'shape', description: 'Text on destructive surfaces.' },
  { name: 'border', group: 'shape', description: 'Default border for cards and inputs.' },
  { name: 'input', group: 'shape', description: 'Input field border.' },
  { name: 'ring', group: 'shape', description: 'Focus-visible ring color.' },
  { name: 'success', group: 'status', description: 'Success state surface.' },
  { name: 'warning', group: 'status', description: 'Warning state surface.' },
  { name: 'info', group: 'status', description: 'Info state surface.' },
  { name: 'danger', group: 'status', description: 'Danger state surface.' },
  { name: 'sidebar', group: 'sidebar', description: 'Sidebar background.' },
  { name: 'sidebar-foreground', group: 'sidebar', description: 'Sidebar default text.' },
  { name: 'sidebar-primary', group: 'sidebar', description: 'Active sidebar item.' },
  { name: 'sidebar-accent', group: 'sidebar', description: 'Sidebar hover accent.' },
  { name: 'sidebar-border', group: 'sidebar', description: 'Sidebar divider.' },
  { name: 'sidebar-ring', group: 'sidebar', description: 'Sidebar focus ring.' },
  { name: 'chart-1', group: 'chart', description: 'Chart series 1.' },
  { name: 'chart-2', group: 'chart', description: 'Chart series 2.' },
  { name: 'chart-3', group: 'chart', description: 'Chart series 3.' },
  { name: 'chart-4', group: 'chart', description: 'Chart series 4.' },
  { name: 'chart-5', group: 'chart', description: 'Chart series 5.' },
  { name: 'text-primary', group: 'text', description: 'Primary text color.' },
  { name: 'text-secondary', group: 'text', description: 'Secondary text color.' },
  { name: 'text-muted', group: 'text', description: 'Muted metadata text.' },
  { name: 'text-link', group: 'text', description: 'Link text color.' },
  { name: 'highlight-foreground', group: 'text', description: 'Highlighted text.' },
];

export type ShellToken = { name: string; description: string };

export const shellTokens: ShellToken[] = [
  { name: 'shell-header', description: 'Top header background.' },
  { name: 'shell-rail', description: 'Icon rail background.' },
  { name: 'shell-context', description: 'Context rail background.' },
  { name: 'shell-main', description: 'Main content background.' },
  { name: 'shell-panel', description: 'Right panel background.' },
  { name: 'shell-border', description: 'Shell-region dividers.' },
  { name: 'shell-shadow', description: 'Default elevation for floating shell surfaces.' },
];

export type ScaleToken = { name: string; px: number; cssVar: string };

export const spacingTokens: ScaleToken[] = [
  { name: 'xs', px: 4, cssVar: '--spacing-xs' },
  { name: 'sm', px: 8, cssVar: '--spacing-sm' },
  { name: 'md', px: 12, cssVar: '--spacing-md' },
  { name: 'lg', px: 16, cssVar: '--spacing-lg' },
  { name: 'xl', px: 24, cssVar: '--spacing-xl' },
  { name: '2xl', px: 32, cssVar: '--spacing-2xl' },
  { name: '3xl', px: 48, cssVar: '--spacing-3xl' },
  { name: '4xl', px: 64, cssVar: '--spacing-4xl' },
];

export const radiusTokens: { name: string; value: string; cssVar: string }[] = [
  { name: 'sm', value: '4px', cssVar: '--radius-sm' },
  { name: 'md', value: '6px', cssVar: '--radius-md' },
  { name: 'lg', value: '8px', cssVar: '--radius-lg' },
  { name: 'xl', value: '12px', cssVar: '--radius-xl' },
  { name: '2xl', value: '16px', cssVar: '--radius-2xl' },
  { name: '3xl', value: '20px', cssVar: '--radius-3xl' },
  { name: '4xl', value: '24px', cssVar: '--radius-4xl' },
  { name: 'full', value: '9999px', cssVar: '--radius-full' },
];

export const motionTokens: { name: string; duration: string; cssVar: string; usage: string }[] = [
  { name: 'fast', duration: '140ms', cssVar: '--motion-fast', usage: 'Hover and press states.' },
  {
    name: 'default',
    duration: '200ms',
    cssVar: '--motion-default',
    usage: 'Standard transitions.',
  },
  { name: 'panel', duration: '240ms', cssVar: '--motion-panel', usage: 'Panel open and close.' },
  {
    name: 'fullscreen',
    duration: '280ms',
    cssVar: '--motion-fullscreen',
    usage: 'Fullscreen overlays.',
  },
];

export const zIndexTokens: { name: string; value: string; usage: string }[] = [
  { name: 'shell-header', value: '40', usage: 'Top header bar.' },
  { name: 'shell-panel', value: '45', usage: 'Right panel above main content.' },
  { name: 'shell-fullscreen', value: '60', usage: 'Fullscreen overlay above panels.' },
];

export type ShadowToken = { name: string; value: string; cssVar: string; usage: string };

export const shadowTokens: ShadowToken[] = [
  {
    name: 'shell-shadow',
    value: '0 4px 12px hsl(0 0% 0% / 0.04)',
    cssVar: '--shell-shadow',
    usage: 'Default shell-region elevation. Dark mode uses a heavier value.',
  },
];

export const typographyTokens = {
  family: {
    sans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Geist Mono", "SF Mono", "Fira Code", monospace',
  },
  sizes: [
    { name: 'display', cssVar: '--font-size-display', px: 36, usage: 'Display headline.' },
    { name: 'h1', cssVar: '--font-size-h1', px: 30, usage: 'Page title.' },
    { name: 'h2', cssVar: '--font-size-h2', px: 24, usage: 'Section heading.' },
    { name: 'h3', cssVar: '--font-size-h3', px: 20, usage: 'Subsection heading.' },
    { name: 'h4', cssVar: '--font-size-h4', px: 18, usage: 'Card heading.' },
    { name: 'body-lg', cssVar: '--font-size-body-lg', px: 16, usage: 'Lead paragraph.' },
    { name: 'body', cssVar: '--font-size-body', px: 14, usage: 'Default body text.' },
    { name: 'body-sm', cssVar: '--font-size-body-sm', px: 13, usage: 'Compact body text.' },
    { name: 'caption', cssVar: '--font-size-caption', px: 11, usage: 'Caption text.' },
    { name: 'overline', cssVar: '--font-size-overline', px: 10, usage: 'Overline label.' },
  ],
  weights: [
    { name: 'regular', value: 400 },
    { name: 'medium', value: 500 },
    { name: 'semibold', value: 600 },
    { name: 'bold', value: 700 },
  ],
};
