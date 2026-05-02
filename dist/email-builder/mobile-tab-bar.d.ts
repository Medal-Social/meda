import type { EmailBuilderLabels } from './types.js';
interface MobileTabBarProps {
    labels: EmailBuilderLabels;
    onOpenBlocks: () => void;
    onOpenInspector: () => void;
    onOpenSettings: () => void;
}
/** Bottom-of-screen tab bar visible on mobile. */
export declare function MobileTabBar({ labels, onOpenBlocks, onOpenInspector, onOpenSettings, }: MobileTabBarProps): import("react/jsx-runtime").JSX.Element;
export {};
