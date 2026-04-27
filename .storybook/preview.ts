import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

import '../src/styles/globals.css';

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
    chromatic: {
      // Single 1280px snapshot per story by default; override per-story when
      // a viewport-specific layout matters.
      viewports: [1280],
      pauseAnimationAtEnd: true,
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
