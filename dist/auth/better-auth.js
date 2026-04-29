'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { AuthProviderButton } from './auth-provider-button.js';
export function BetterAuthProviderButton({ authClient, provider = 'google', callbackURL, errorCallbackURL, onPendingChange, onError, onSuccess, loading, ...props }) {
    const [internalPending, setInternalPending] = useState(false);
    const pending = Boolean(loading || internalPending);
    return (_jsx(AuthProviderButton, { ...props, provider: provider, loading: pending, onClick: async () => {
            const social = authClient.signIn?.social;
            if (!social) {
                onError?.(new Error('better-auth social sign-in is unavailable.'));
                return;
            }
            setInternalPending(true);
            onPendingChange?.(true);
            try {
                const result = await social({ provider, callbackURL, errorCallbackURL });
                onSuccess?.(result);
            }
            catch (error) {
                onError?.(error);
            }
            finally {
                setInternalPending(false);
                onPendingChange?.(false);
            }
        } }));
}
export function useBetterAuthLastLoginMethod(authClient) {
    const [method, setMethod] = useState(null);
    useEffect(() => {
        let active = true;
        async function loadLastMethod() {
            try {
                const getter = authClient.getLastUsedLoginMethod;
                const nextMethod = getter ? await getter() : null;
                if (active) {
                    setMethod(nextMethod ?? null);
                }
            }
            catch {
                if (active) {
                    setMethod(null);
                }
            }
        }
        void loadLastMethod();
        return () => {
            active = false;
        };
    }, [authClient]);
    return method;
}
export function BetterAuthOneTap({ authClient, enabled = true, callbackURL, onError, onSuccess, }) {
    const onErrorRef = useRef(onError);
    const onSuccessRef = useRef(onSuccess);
    useEffect(() => {
        onErrorRef.current = onError;
        onSuccessRef.current = onSuccess;
    }, [onError, onSuccess]);
    useEffect(() => {
        if (!enabled || !authClient.oneTap) {
            return;
        }
        let active = true;
        async function mountOneTap() {
            try {
                const result = await authClient.oneTap?.({ callbackURL });
                if (active) {
                    onSuccessRef.current?.(result);
                }
            }
            catch (error) {
                if (active) {
                    onErrorRef.current?.(error);
                }
            }
        }
        void mountOneTap();
        return () => {
            active = false;
        };
    }, [authClient, callbackURL, enabled]);
    return null;
}
export function createBetterAuthAdapter(authClient) {
    return {
        BetterAuthProviderButton: (props) => (_jsx(BetterAuthProviderButton, { authClient: authClient, ...props })),
        BetterAuthOneTap: (props) => (_jsx(BetterAuthOneTap, { authClient: authClient, ...props })),
        useBetterAuthLastLoginMethod: () => useBetterAuthLastLoginMethod(authClient),
    };
}
