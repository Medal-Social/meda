// State and layout primitives for consumers that want Meda shell behavior
// without importing the full styled shell barrel.
export { createLocalStorageAdapter } from './layout-state.js';
export { PanelViewsProvider } from './panel-views-provider.js';
export { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';
export { MedaShellProvider, useMedaShell, useShellSelection } from './shell-provider.js';
export { useShellViewport } from './use-shell-viewport.js';
