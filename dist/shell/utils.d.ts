import type { ShellCommandDefinition, ShellModuleDefinition, ShellPanelDefinition } from './types.js';
export interface ShellPanelCollection {
    globalViews: ShellPanelDefinition[];
    moduleViews: ShellPanelDefinition[];
    views: ShellPanelDefinition[];
}
export declare function buildShellShortcutMap(modules: Record<string, ShellModuleDefinition>): Map<string, string>;
export declare function buildShellSectionCommands(module: Pick<ShellModuleDefinition, 'id' | 'items'> | null, group?: string): ShellCommandDefinition[];
export declare function getShellPanelCollection({ globalPanelViews, panelViews, productPanelViews, sectionKey, selectedProductId, }: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
}): ShellPanelCollection;
export declare function getDefaultShellPanelView(options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
}): string;
export declare function isShellPanelViewAvailable(options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
}, viewId: string | null): boolean;
export declare function resolveShellPanelView(options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
}, viewId: string | null): string | null;
export declare function getShellPanelView(options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
}, viewId: string | null): ShellPanelDefinition | null;
