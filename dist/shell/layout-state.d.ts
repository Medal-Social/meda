import type { PanelMode } from './types.js';
export interface ShellStorageAdapter {
    load: (key: string) => unknown;
    save: (key: string, value: unknown) => void;
}
export declare function createLocalStorageAdapter(): ShellStorageAdapter;
export interface ShellLayoutState {
    contextRail: {
        width: number;
        collapsed: boolean;
    };
    rightPanel: {
        mode: PanelMode;
        activeView: string | null;
        width: number;
    };
}
interface UseShellLayoutStateArgs {
    workspaceId: string;
    appId: string;
    storage: ShellStorageAdapter;
}
/**
 * Per-(workspaceId, appId) layout state with localStorage persistence.
 *
 * The `storage` adapter must be referentially stable across renders (typically
 * memoized once at the provider level). An inline-constructed adapter would
 * loop the hydration effect and clobber local mutations.
 */
export declare function useShellLayoutState({ workspaceId, appId, storage, }: UseShellLayoutStateArgs): readonly [ShellLayoutState, (next: ShellLayoutState) => void];
export {};
