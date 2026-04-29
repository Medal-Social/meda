export type MedaThemeMode = 'light' | 'dark';

export type MedaThemeTokenMap = Record<string, string | undefined>;

export interface MedaThemeModeConfig {
  colors?: MedaThemeTokenMap;
  fonts?: MedaThemeTokenMap;
  tokens?: MedaThemeTokenMap;
}

export interface MedaThemeConfig extends MedaThemeModeConfig {
  appId: string;
  selector?: string;
  light?: MedaThemeModeConfig;
  dark?: MedaThemeModeConfig;
}

export interface MedaThemeDefinition {
  appId: string;
  selector: string;
  light: Required<MedaThemeModeConfig>;
  dark: Required<MedaThemeModeConfig>;
}

const MODE_KEYS = ['colors', 'fonts', 'tokens'] as const;

function assertAppId(appId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) {
    throw new Error('Meda theme appId must contain only letters, numbers, underscores, or dashes.');
  }
}

function toCssVariableName(group: (typeof MODE_KEYS)[number], key: string) {
  const normalized = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  if (normalized.startsWith('--')) {
    return normalized;
  }
  if (group === 'fonts') {
    return `--font-${normalized}`;
  }
  return `--${normalized}`;
}

function mergeModeConfig(base: MedaThemeModeConfig, mode: MedaThemeModeConfig = {}) {
  return {
    colors: { ...base.colors, ...mode.colors },
    fonts: { ...base.fonts, ...mode.fonts },
    tokens: { ...base.tokens, ...mode.tokens },
  };
}

export function defineMedaTheme(config: MedaThemeConfig): MedaThemeDefinition {
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

function entriesForMode(mode: Required<MedaThemeModeConfig>) {
  return MODE_KEYS.flatMap((group) =>
    Object.entries(mode[group])
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([key, value]) => [toCssVariableName(group, key), value] as const)
  ).sort(([left], [right]) => left.localeCompare(right));
}

function renderBlock(selector: string, entries: ReadonlyArray<readonly [string, string]>) {
  const declarations = entries.map(([key, value]) => `  ${key}: ${value};`).join('\n');
  return `${selector} {\n${declarations}\n}`;
}

export function createMedaThemeCss(theme: MedaThemeDefinition) {
  const lightEntries = entriesForMode(theme.light);
  const darkEntries = entriesForMode(theme.dark);
  const darkSelector = `${theme.selector}.dark, ${theme.selector}[data-theme="dark"]`;

  return [renderBlock(theme.selector, lightEntries), renderBlock(darkSelector, darkEntries)].join(
    '\n\n'
  );
}
