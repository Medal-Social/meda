import type { ReactNode } from 'react';
import type { ShellModuleDefinition, ShellNavItem } from './types.js';
interface ShellModuleNavRenderArgs {
    children: ReactNode;
    className: string;
    isActive: boolean;
    item: ShellNavItem;
}
export interface ShellModuleNavProps {
    module: Pick<ShellModuleDefinition, 'description' | 'items' | 'label'>;
    ariaLabel: string;
    className?: string;
    descriptionClassName?: string;
    headerClassName?: string;
    itemClassName?: string;
    activeItemClassName?: string;
    inactiveItemClassName?: string;
    itemsClassName?: string;
    itemIconClassName?: string;
    itemIconSize?: number;
    itemLabelClassName?: string;
    itemDescriptionClassName?: string;
    itemShortcutClassName?: string;
    titleClassName?: string;
    isItemActive: (item: ShellNavItem) => boolean;
    renderLink: (args: ShellModuleNavRenderArgs) => ReactNode;
}
export declare function ShellModuleNav({ module, ariaLabel, className, descriptionClassName, headerClassName, itemClassName, activeItemClassName, inactiveItemClassName, itemsClassName, itemIconClassName, itemIconSize, itemLabelClassName, itemDescriptionClassName, itemShortcutClassName, titleClassName, isItemActive, renderLink, }: ShellModuleNavProps): import("react/jsx-runtime").JSX.Element;
export {};
