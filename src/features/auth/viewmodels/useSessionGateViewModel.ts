import { useStores } from '@/stores/DependenciesProvider';

export type StartHref = '/onboarding' | '/sign-in' | '/drive';

export type SessionGateViewModel = {
  // The saved session has been read back, so the guards below are final.
  hasHydrated: boolean;
  // Which route groups are reachable right now.
  canOnboard: boolean;
  canSignIn: boolean;
  canUseApp: boolean;
  // Where the app opens: onboarding first, then sign-in, then the Drive tab.
  startHref: StartHref;
};

export function useSessionGateViewModel(): SessionGateViewModel {
  const { useSessionStore } = useStores();
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const user = useSessionStore((s) => s.user);
  const hasCompletedOnboarding = useSessionStore((s) => s.hasCompletedOnboarding);
  const signedIn = user !== null;

  return {
    hasHydrated,
    canOnboard: !hasCompletedOnboarding,
    canSignIn: hasCompletedOnboarding && !signedIn,
    canUseApp: signedIn,
    startHref: !hasCompletedOnboarding ? '/onboarding' : !signedIn ? '/sign-in' : '/drive',
  };
}
