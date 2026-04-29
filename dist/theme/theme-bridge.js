const MODE_KEYS = ['colors', 'fonts', 'tokens'];
function assertAppId(appId) {
    if (!/^[a-zA-Z0-9_-]+$/.test(appId)) {
        throw new Error('Meda theme appId must contain only letters, numbers, underscores, or dashes.');
    }
}
function toCssVariableName(group, key) {
    const normalized = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    if (normalized.startsWith('--')) {
        return normalized;
    }
    if (group === 'fonts') {
        return `--font-${normalized}`;
    }
    return `--${normalized}`;
}
function mergeModeConfig(base, mode = {}) {
    return {
        colors: { ...base.colors, ...mode.colors },
        fonts: { ...base.fonts, ...mode.fonts },
        tokens: { ...base.tokens, ...mode.tokens },
    };
}
export function defineMedaTheme(config) {
    assertAppId(config.appId);
    const base = {
        colors: config.colors ?? {},
        fonts: config.fonts ?? {},
        tokens: config.tokens ?? {},
    };
    return {
        appId: config.appId,
        selector: config.selector ?? `[data-meda-app="${config.appId}"]`,
        light: mergeModeConfig(base, config.light),
        dark: mergeModeConfig(base, config.dark),
    };
}
function entriesForMode(mode) {
    return MODE_KEYS.flatMap((group) => Object.entries(mode[group])
        .filter((entry) => typeof entry[1] === 'string')
        .map(([key, value]) => [toCssVariableName(group, key), value])).sort(([left], [right]) => left.localeCompare(right));
}
function renderBlock(selector, entries) {
    const declarations = entries.map(([key, value]) => `  ${key}: ${value};`).join('\n');
    return `${selector} {\n${declarations}\n}`;
}
export function createMedaThemeCss(theme) {
    const lightEntries = entriesForMode(theme.light);
    const darkEntries = entriesForMode(theme.dark);
    const darkSelector = `${theme.selector}.dark, ${theme.selector}[data-theme="dark"]`;
    return [renderBlock(theme.selector, lightEntries), renderBlock(darkSelector, darkEntries)].join('\n\n');
}
