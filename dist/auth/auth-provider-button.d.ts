import type { ButtonHTMLAttributes, ReactNode } from 'react';
export type AuthProvider = 'google' | (string & {});
export interface AuthProviderButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    provider?: AuthProvider;
    label: ReactNode;
    icon?: ReactNode;
    loading?: boolean;
    loadingLabel?: ReactNode;
    lastUsed?: boolean;
    lastUsedLabel?: ReactNode;
}
export declare function AuthProviderButton({ provider, label, icon, loading, loadingLabel, lastUsed, lastUsedLabel, disabled, className, type, ...props }: AuthProviderButtonProps): import("react/jsx-runtime").JSX.Element;
