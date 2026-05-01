import type { LucideIcon } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
export type EmptyStateVariant = 'default' | 'panel' | 'inline';
export interface EmptyStateProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
    icon?: LucideIcon | ReactNode;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    variant?: EmptyStateVariant;
}
export declare function EmptyState({ icon, title, description, action, variant, className, ...props }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
