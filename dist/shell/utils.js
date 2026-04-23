export function buildShellShortcutMap(modules) {
    const map = new Map();
    for (const section of Object.values(modules)) {
        for (const item of section.items) {
            if (item.shortcut) {
                map.set(item.shortcut, item.to);
            }
        }
    }
    return map;
}
export function buildShellSectionCommands(module, group = 'Current Section') {
    if (!module)
        return [];
    return module.items.map((item) => ({
        id: `${module.id}:${item.to}`,
        label: item.label,
        to: item.to,
        icon: item.icon,
        group,
        shortcut: item.shortcut,
    }));
}
export function getShellPanelCollection({ globalPanelViews = [], panelViews, productPanelViews = [], sectionKey, selectedProductId = null, }) {
    const moduleViews = selectedProductId ? productPanelViews : (panelViews[sectionKey] ?? []);
    const globalViews = globalPanelViews;
    return {
        moduleViews,
        globalViews,
        views: [...moduleViews, ...globalViews],
    };
}
export function getDefaultShellPanelView(options) {
    return getShellPanelCollection(options).views[0]?.id ?? null;
}
export function isShellPanelViewAvailable(options, viewId) {
    if (!viewId)
        return false;
    return getShellPanelCollection(options).views.some((view) => view.id === viewId);
}
export function resolveShellPanelView(options, viewId) {
    if (!viewId)
        return null;
    return isShellPanelViewAvailable(options, viewId) ? viewId : getDefaultShellPanelView(options);
}
export function getShellPanelView(options, viewId) {
    if (!viewId)
        return null;
    return getShellPanelCollection(options).views.find((view) => view.id === viewId) ?? null;
}
