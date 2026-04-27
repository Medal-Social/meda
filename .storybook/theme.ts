import { create } from 'storybook/theming';

const brand = {
  purple100: '#eeeaf5',
  purple200: '#dcd4e8',
  purple400: '#9a6ac2',
  purple500: '#7e3fac',
  purple600: '#6a2e96',
  purple800: '#2f1552',
  neutral50: '#fafafa',
  neutral200: '#e4e4e7',
  neutral400: '#a1a1aa',
  neutral500: '#52525b',
  neutral800: '#18181b',
  neutral900: '#111113',
  neutral950: '#09090b',
};

const medaLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="184" height="40" viewBox="0 0 184 40" fill="none">
  <rect x="1" y="4" width="32" height="32" rx="8" fill="${brand.purple500}"/>
  <g transform="translate(1 4) scale(0.6667)">
    <path d="M8 24L24 8L40 24L24 40L8 24Z" stroke="${brand.neutral50}" stroke-width="1.3" fill="none"/>
    <circle cx="24" cy="8.5" r="2.5" fill="${brand.neutral50}"/>
    <circle cx="39.5" cy="24" r="2.5" fill="${brand.neutral50}"/>
    <circle cx="24" cy="39.5" r="2.5" fill="${brand.neutral50}"/>
    <circle cx="8.5" cy="24" r="2.5" fill="${brand.neutral50}"/>
    <path d="M21.937 27.5A2 2 0 0 0 20.5 26.063L14.365 24.481a0.5 0.5 0 0 1 0-0.962L20.5 21.936A2 2 0 0 0 21.937 20.5l1.582-6.135a0.5 0.5 0 0 1 0.963 0L26.063 20.5A2 2 0 0 0 27.5 21.937l6.135 1.581a0.5 0.5 0 0 1 0 0.964L27.5 26.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a0.5 0.5 0 0 1-0.963 0z" fill="none" stroke="${brand.neutral50}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="44" y="18" fill="${brand.neutral50}" font-family="Geist, Inter, Arial, sans-serif" font-size="16" font-weight="700">Meda UI</text>
  <text x="44" y="31" fill="${brand.neutral400}" font-family="Geist, Inter, Arial, sans-serif" font-size="10" font-weight="600">by Medal Social</text>
</svg>
`.trim();

const medaBrandImage = `data:image/svg+xml,${encodeURIComponent(medaLogoSvg)}`;

export const medaLight = create({
  base: 'light',
  brandTitle: 'Meda UI by Medal Social',
  brandImage: medaBrandImage,
  brandUrl: 'https://meda.medalsocial.com',
  brandTarget: '_self',
  colorPrimary: brand.purple600,
  colorSecondary: brand.purple500,
  appBg: brand.neutral50,
  appContentBg: '#ffffff',
  appBorderColor: brand.neutral200,
  appBorderRadius: 6,
  textColor: brand.neutral950,
  textInverseColor: brand.neutral50,
  textMutedColor: brand.neutral500,
  barTextColor: brand.neutral500,
  barSelectedColor: brand.purple600,
  barBg: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: brand.neutral200,
  inputTextColor: brand.neutral950,
  inputBorderRadius: 6,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"Geist Mono", "SF Mono", "Fira Code", monospace',
});

export const medaDark = create({
  base: 'dark',
  brandTitle: 'Meda UI by Medal Social',
  brandImage: medaBrandImage,
  brandUrl: 'https://meda.medalsocial.com',
  brandTarget: '_self',
  colorPrimary: brand.purple400,
  colorSecondary: brand.purple200,
  appBg: brand.neutral950,
  appContentBg: brand.neutral900,
  appBorderColor: '#2e2e33',
  appBorderRadius: 6,
  textColor: brand.neutral50,
  textInverseColor: brand.neutral950,
  textMutedColor: '#a1a1aa',
  barTextColor: '#a1a1aa',
  barSelectedColor: brand.purple100,
  barBg: brand.neutral900,
  inputBg: brand.neutral800,
  inputBorder: '#2e2e33',
  inputTextColor: brand.neutral50,
  inputBorderRadius: 6,
  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"Geist Mono", "SF Mono", "Fira Code", monospace',
});

export const medaManagerStyles = `
  :root {
    color-scheme: dark;
    --meda-sidebar-bg: ${brand.neutral950};
    --meda-sidebar-surface: ${brand.neutral900};
    --meda-sidebar-surface-hover: rgba(154, 106, 194, 0.12);
    --meda-sidebar-border: #2e2e33;
    --meda-sidebar-muted: ${brand.neutral400};
    --meda-sidebar-text: ${brand.neutral200};
    --meda-sidebar-selected: ${brand.purple800};
    --meda-sidebar-accent: ${brand.purple400};
    --meda-sidebar-accent-soft: ${brand.purple100};
  }

  body,
  #root {
    background: var(--meda-sidebar-bg) !important;
  }

  a[href="https://meda.medalsocial.com"] {
    align-items: center !important;
    background: linear-gradient(180deg, rgba(154, 106, 194, 0.14), rgba(24, 24, 27, 0.72)) !important;
    border: 1px solid rgba(154, 106, 194, 0.22) !important;
    border-radius: 8px !important;
    display: flex !important;
    min-height: 60px !important;
    padding: 10px 12px !important;
  }

  a[href="https://meda.medalsocial.com"]:focus-visible {
    box-shadow: 0 0 0 2px rgba(154, 106, 194, 0.42) !important;
    outline: none !important;
  }

  a[href="https://meda.medalsocial.com"] img {
    display: block !important;
    height: 40px !important;
    max-width: 184px !important;
    object-fit: contain !important;
    width: 184px !important;
  }

  input[placeholder="Find components"] {
    background: var(--meda-sidebar-surface) !important;
    border: 1px solid var(--meda-sidebar-border) !important;
    border-radius: 8px !important;
    color: ${brand.neutral50} !important;
  }

  input[placeholder="Find components"]::placeholder {
    color: var(--meda-sidebar-muted) !important;
  }

  input[placeholder="Find components"]:focus {
    border-color: var(--meda-sidebar-accent) !important;
    box-shadow: 0 0 0 2px rgba(154, 106, 194, 0.3) !important;
  }

  #storybook-explorer-menu {
    background: var(--meda-sidebar-bg) !important;
    padding: 8px 10px 18px !important;
  }

  #storybook-explorer-menu .sidebar-subheading {
    color: var(--meda-sidebar-muted) !important;
    font-weight: 700 !important;
  }

  #storybook-explorer-menu .sidebar-item {
    border-radius: 8px !important;
    color: var(--meda-sidebar-text) !important;
    min-height: 34px !important;
    transition:
      background-color 140ms ease,
      box-shadow 140ms ease,
      color 140ms ease !important;
  }

  #storybook-explorer-menu .sidebar-item:hover,
  #storybook-explorer-menu .sidebar-item:focus-visible {
    background: var(--meda-sidebar-surface-hover) !important;
    color: ${brand.neutral50} !important;
  }

  #storybook-explorer-menu [data-selected="true"].sidebar-item {
    background:
      linear-gradient(90deg, rgba(154, 106, 194, 0.34), rgba(47, 21, 82, 0.92)),
      var(--meda-sidebar-selected) !important;
    box-shadow:
      inset 3px 0 0 var(--meda-sidebar-accent),
      inset 0 0 0 1px rgba(238, 234, 245, 0.1) !important;
    color: ${brand.neutral50} !important;
  }

  #storybook-explorer-menu [data-nodetype="document"] svg,
  #storybook-explorer-menu [data-nodetype="story"] svg {
    color: var(--meda-sidebar-accent) !important;
  }

  #storybook-explorer-menu [data-selected="true"] svg {
    color: var(--meda-sidebar-accent-soft) !important;
  }

  #storybook-explorer-menu button svg {
    color: var(--meda-sidebar-muted) !important;
  }
`;
