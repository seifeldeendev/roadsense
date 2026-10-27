import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';
import { useSessionGateViewModel } from '../viewmodels/useSessionGateViewModel';

type SessionGateProps = {
  // Whatever else the first frame waits for (the fonts).
  ready: boolean;
  children: ReactNode;
};

// Holds the app behind the native splash until the saved session is read back,
// so the first screen is the right one for this user.
export function SessionGate({ ready, children }: SessionGateProps) {
  const { hasHydrated } = useSessionGateViewModel();
  const open = ready && hasHydrated;

  useEffect(() => {
    if (open) {
      void SplashScreen.hideAsync();
    }
  }, [open]);

  return open ? children : null;
}
