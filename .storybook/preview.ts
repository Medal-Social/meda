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
      // Run axe checks on every story render. In vitest browser mode the
      // story is rendered into the iframe body directly; passing an explicit
      // `context: '#storybook-root'` selector caused axe to throw
      // "No elements found for include in frame Context" because that
      // wrapper element does not exist in that runtime. Letting axe default
      // to the document scopes the scan to whatever the story actually rendered.
      manual: false,
      // Strict mode: any axe violation FAILS the story test. Per-story
      // exemptions live as `parameters.a11y.test = 'todo'` (or rule-level
      // `disable: true`) on the offending story with a written reason.
      test: 'error',
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
