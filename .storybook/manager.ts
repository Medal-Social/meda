import { addons } from 'storybook/manager-api';
import { medaDark } from './theme';

addons.setConfig({
  theme: medaDark,
  showToolbar: true,
  panelPosition: 'bottom',
  sidebar: {
    showRoots: true,
  },
});
