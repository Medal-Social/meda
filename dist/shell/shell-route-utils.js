function getLastMatch(matches) {
    return matches[matches.length - 1];
}
function getRouteHandle(match) {
    return match?.handle;
}
export function getShellContentLayoutFromMatches(matches) {
    return getRouteHandle(getLastMatch(matches))?.shellContentLayout ?? 'workspace';
}
export function getShellTabsFromMatches(matches, pathname) {
    const lastMatch = getLastMatch(matches);
    const shellTabs = getRouteHandle(lastMatch)?.shellTabs;
    if (!shellTabs)
        return [];
    if (typeof shellTabs === 'function') {
        return shellTabs({ params: lastMatch.params ?? {}, pathname });
    }
    return shellTabs;
}
export function getShellActionsFromMatches(matches, pathname) {
    const lastMatch = getLastMatch(matches);
    const shellActions = getRouteHandle(lastMatch)?.shellActions;
    if (!shellActions)
        return null;
    if (typeof shellActions === 'function') {
        return shellActions({ params: lastMatch.params ?? {}, pathname });
    }
    return shellActions;
}
export function getShellPanelViewsFromMatches(matches) {
    return getRouteHandle(getLastMatch(matches))?.shellPanelViews;
}
