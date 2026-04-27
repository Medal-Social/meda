import { addons } from 'storybook/manager-api';
import { medaDark, medaManagerStyles } from './theme';

addons.setConfig({
  theme: medaDark,
  showToolbar: true,
  panelPosition: 'bottom',
  sidebar: {
    showRoots: true,
  },
});

const managerStyleId = 'meda-storybook-manager-theme';

if (typeof document !== 'undefined' && !document.getElementById(managerStyleId)) {
  const managerStyle = document.createElement('style');
  managerStyle.id = managerStyleId;
  managerStyle.textContent = medaManagerStyles;
  document.head.appendChild(managerStyle);
}
