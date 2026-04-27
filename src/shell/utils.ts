import type {
  ShellCommandDefinition,
  ShellModuleDefinition,
  ShellPanelDefinition,
} from './extras/types.js';

export interface ShellPanelCollection {
  globalViews: ShellPanelDefinition[];
  moduleViews: ShellPanelDefinition[];
  views: ShellPanelDefinition[];
}

export function buildShellShortcutMap(modules: Record<string, ShellModuleDefinition>) {
  const map = new Map<string, string>();

  for (const section of Object.values(modules)) {
    for (const item of section.items) {
      if (item.shortcut) {
        map.set(item.shortcut, item.to);
      }
    }
  }

  return map;
}

export function buildShellSectionCommands(
  module: Pick<ShellModuleDefinition, 'id' | 'items'> | null,
  group = 'Current Section'
): ShellCommandDefinition[] {
  if (!module) return [];

  return module.items.map((item) => ({
    id: `${module.id}:${item.to}`,
    label: item.label,
    to: item.to,
    icon: item.icon,
    group,
    shortcut: item.shortcut,
  }));
}

export function getShellPanelCollection({
  globalPanelViews = [],
  panelViews,
  productPanelViews = [],
  sectionKey,
  selectedProductId = null,
}: {
  globalPanelViews?: ShellPanelDefinition[];
  panelViews: Record<string, ShellPanelDefinition[]>;
  productPanelViews?: ShellPanelDefinition[];
  sectionKey: string;
  selectedProductId?: string | null;
}): ShellPanelCollection {
  const moduleViews = selectedProductId ? productPanelViews : (panelViews[sectionKey] ?? []);
  const globalViews = globalPanelViews;

  return {
    moduleViews,
    globalViews,
    views: [...moduleViews, ...globalViews],
  };
}

export function getDefaultShellPanelView(options: {
  globalPanelViews?: ShellPanelDefinition[];
  panelViews: Record<string, ShellPanelDefinition[]>;
  productPanelViews?: ShellPanelDefinition[];
  sectionKey: string;
  selectedProductId?: string | null;
}) {
  return getShellPanelCollection(options).views[0]?.id ?? null;
}

export function isShellPanelViewAvailable(
  options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
  },
  viewId: string | null
) {
  if (!viewId) return false;

  return getShellPanelCollection(options).views.some((view) => view.id === viewId);
}

export function resolveShellPanelView(
  options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
  },
  viewId: string | null
) {
  if (!viewId) return null;

  return isShellPanelViewAvailable(options, viewId) ? viewId : getDefaultShellPanelView(options);
}

export function getShellPanelView(
  options: {
    globalPanelViews?: ShellPanelDefinition[];
    panelViews: Record<string, ShellPanelDefinition[]>;
    productPanelViews?: ShellPanelDefinition[];
    sectionKey: string;
    selectedProductId?: string | null;
  },
  viewId: string | null
) {
  if (!viewId) return null;

  return getShellPanelCollection(options).views.find((view) => view.id === viewId) ?? null;
}
