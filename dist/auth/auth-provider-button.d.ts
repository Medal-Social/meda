import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { type RenderElement } from '../lib/render-element.js';
export type AuthProvider = 'google' | (string & {});
export interface AuthProviderButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    provider?: AuthProvider;
    label: ReactNode;
    icon?: ReactNode;
    loading?: boolean;
    loadingLabel?: ReactNode;
    lastUsed?: boolean;
    lastUsedLabel?: ReactNode;
    render?: RenderElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}
export declare function AuthProviderButton({ provider, label, icon, loading, loadingLabel, lastUsed, lastUsedLabel, render, disabled, className, type, ...props }: AuthProviderButtonProps): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
