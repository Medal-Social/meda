import { type HTMLAttributes, type ReactNode } from 'react';
export interface AuthProviderListProps extends HTMLAttributes<HTMLUListElement> {
    children: ReactNode;
    label?: string;
}
export declare function AuthProviderList({ children, className, label, ...props }: AuthProviderListProps): import("react/jsx-runtime").JSX.Element;
