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
export declare function defineMedaTheme(config: MedaThemeConfig): MedaThemeDefinition;
export declare function createMedaThemeCss(theme: MedaThemeDefinition): string;
