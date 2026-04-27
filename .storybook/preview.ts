import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

// Storybook-specific globals: Tailwind + tokens + the package's own globals.
// Mirrors the demo app's CSS pipeline so primitives render with their
// production styling under both Storybook and Chromatic.
import '../src/__stories__/storybook-globals.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true }, // theme decorator drives background
    options: {
      storySort: {
        order: [
          'Get Started',
          ['Introduction', 'Installation', 'Theming'],
          'Foundations',
          [
            'Color',
            'Typography',
            'Spacing',
            'Radii',
            'Shadows',
            'Motion',
            'Z-Index',
            'Iconography',
          ],
          'Shell v2',
          'Marketing',
          'Chat',
          'Timeline',
          'Voice',
          'Panel',
          'Inbox',
          '*',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      // Run axe checks on every story render in the addon panel.
      context: '#storybook-root',
      manual: false,
      // In vitest browser mode, surface a11y violations as todos rather than
      // failing the test run — the dedicated `pnpm test` (jsdom) and
      // Chromatic a11y reports are the source of truth.
      test: 'off',
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
