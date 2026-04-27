import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

// Storybook-specific globals: Tailwind + tokens + the package's own globals.
// Mirrors the demo app's CSS pipeline so primitives render with their
// production styling under both Storybook and Playwright visual snapshots.
import '../src/__stories__/storybook-globals.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true }, // theme decorator drives background
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      // Run axe checks on every story render in the addon panel.
      element: '#storybook-root',
      manual: false,
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
