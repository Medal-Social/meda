import type { ComponentPropsWithoutRef, ReactNode } from 'react';
export interface FilterRailProps extends Omit<ComponentPropsWithoutRef<'aside'>, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
    search?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}
export interface FilterRailGroupProps extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
}
declare function FilterRailGroup({ title, description, children, className, ...props }: FilterRailGroupProps): import("react/jsx-runtime").JSX.Element;
declare function FilterRailRoot({ title, description, search, actions, footer, children, className, 'aria-label': ariaLabel, ...props }: FilterRailProps): import("react/jsx-runtime").JSX.Element;
export declare const FilterRail: typeof FilterRailRoot & {
    Group: typeof FilterRailGroup;
};
export {};
