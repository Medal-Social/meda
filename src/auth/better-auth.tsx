'use client';

import { useEffect, useRef, useState } from 'react';
import { AuthProviderButton, type AuthProviderButtonProps } from './auth-provider-button.js';

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

export interface BetterAuthProviderButtonProps
  extends Omit<AuthProviderButtonProps, 'onClick' | 'provider'> {
  authClient: BetterAuthClientLike;
  provider?: string;
  callbackURL?: string;
  errorCallbackURL?: string;
  onPendingChange?: (pending: boolean) => void;
  onError?: (error: unknown) => void;
  onSuccess?: (result: unknown) => void;
}

export function BetterAuthProviderButton({
  authClient,
  provider = 'google',
  callbackURL,
  errorCallbackURL,
  onPendingChange,
  onError,
  onSuccess,
  loading,
  ...props
}: BetterAuthProviderButtonProps) {
  const [internalPending, setInternalPending] = useState(false);
  const pending = Boolean(loading || internalPending);

  return (
    <AuthProviderButton
      {...props}
      provider={provider}
      loading={pending}
      onClick={async () => {
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
        } catch (error) {
          onError?.(error);
        } finally {
          setInternalPending(false);
          onPendingChange?.(false);
        }
      }}
    />
  );
}

export function useBetterAuthLastLoginMethod(authClient: BetterAuthClientLike) {
  const [method, setMethod] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLastMethod() {
      try {
        const getter = authClient.getLastUsedLoginMethod;
        const nextMethod = getter ? await getter() : null;
        if (active) {
          setMethod(nextMethod ?? null);
        }
      } catch {
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

export interface BetterAuthOneTapProps {
  authClient: BetterAuthClientLike;
  enabled?: boolean;
  callbackURL?: string;
  onError?: (error: unknown) => void;
  onSuccess?: (result: unknown) => void;
}

export function BetterAuthOneTap({
  authClient,
  enabled = true,
  callbackURL,
  onError,
  onSuccess,
}: BetterAuthOneTapProps) {
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
      } catch (error) {
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

export function createBetterAuthAdapter(authClient: BetterAuthClientLike) {
  return {
    BetterAuthProviderButton: (props: Omit<BetterAuthProviderButtonProps, 'authClient'>) => (
      <BetterAuthProviderButton authClient={authClient} {...props} />
    ),
    BetterAuthOneTap: (props: Omit<BetterAuthOneTapProps, 'authClient'>) => (
      <BetterAuthOneTap authClient={authClient} {...props} />
    ),
    useBetterAuthLastLoginMethod: () => useBetterAuthLastLoginMethod(authClient),
  };
}
