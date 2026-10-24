import { useCallback, useState } from 'react';
import type { AuthProvider } from '@/domain/repositories';
import { useSessionStore } from '@/stores/useSessionStore';

export type SocialAuthViewModel = {
  pendingProvider: AuthProvider | null;
  error: string | null;
  continueWith: (provider: AuthProvider) => void;
};

const PROVIDER_LABEL: Record<AuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

export function useSocialAuthViewModel(): SocialAuthViewModel {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signInWithProvider = useSessionStore((s) => s.signInWithProvider);

  const continueWith = useCallback(
    (provider: AuthProvider) => {
      if (pendingProvider !== null) return;
      setError(null);
      setPendingProvider(provider);
      signInWithProvider(provider)
        .catch(() => {
          setError(`Couldn't continue with ${PROVIDER_LABEL[provider]} — try again`);
        })
        .finally(() => {
          setPendingProvider(null);
        });
    },
    [pendingProvider, signInWithProvider],
  );

  return { pendingProvider, error, continueWith };
}
