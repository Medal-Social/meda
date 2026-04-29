import { type AuthProviderButtonProps } from './auth-provider-button.js';
export interface BetterAuthSocialArgs {
    provider: string;
    callbackURL?: string;
    errorCallbackURL?: string;
}
export interface BetterAuthOneTapArgs {
    callbackURL?: string;
}
export interface BetterAuthClientLike {
    signIn?: {
        social?: (args: BetterAuthSocialArgs) => Promise<unknown> | unknown;
    };
    oneTap?: (args: BetterAuthOneTapArgs) => Promise<unknown> | unknown;
    getLastUsedLoginMethod?: () => Promise<string | null | undefined> | string | null | undefined;
}
export interface BetterAuthProviderButtonProps extends Omit<AuthProviderButtonProps, 'onClick' | 'provider'> {
    authClient: BetterAuthClientLike;
    provider?: string;
    callbackURL?: string;
    errorCallbackURL?: string;
    onPendingChange?: (pending: boolean) => void;
    onError?: (error: unknown) => void;
    onSuccess?: (result: unknown) => void;
}
export declare function BetterAuthProviderButton({ authClient, provider, callbackURL, errorCallbackURL, onPendingChange, onError, onSuccess, loading, ...props }: BetterAuthProviderButtonProps): import("react/jsx-runtime").JSX.Element;
export declare function useBetterAuthLastLoginMethod(authClient: BetterAuthClientLike): string | null;
export interface BetterAuthOneTapProps {
    authClient: BetterAuthClientLike;
    enabled?: boolean;
    callbackURL?: string;
    onError?: (error: unknown) => void;
    onSuccess?: (result: unknown) => void;
}
export declare function BetterAuthOneTap({ authClient, enabled, callbackURL, onError, onSuccess, }: BetterAuthOneTapProps): null;
export declare function createBetterAuthAdapter(authClient: BetterAuthClientLike): {
    BetterAuthProviderButton: (props: Omit<BetterAuthProviderButtonProps, "authClient">) => import("react/jsx-runtime").JSX.Element;
    BetterAuthOneTap: (props: Omit<BetterAuthOneTapProps, "authClient">) => import("react/jsx-runtime").JSX.Element;
    useBetterAuthLastLoginMethod: () => string | null;
};
