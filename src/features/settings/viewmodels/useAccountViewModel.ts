import { useCallback, useState } from 'react';
import { router, type Href } from 'expo-router';
import { useSessionStore } from '@/stores/useSessionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export type AccountViewModel = {
  name: string;
  email: string;
  initials: string;
  isDemoDrive: boolean;
  signingOut: boolean;
  open: (href: Href) => void;
  toggleDemoDrive: () => void;
  signOut: () => void;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
}

export function useAccountViewModel(): AccountViewModel {
  const user = useSessionStore((s) => s.user);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = useCallback(() => {
    setSigningOut(true);
    void useSessionStore
      .getState()
      .signOut()
      .finally(() => setSigningOut(false));
  }, []);

  const name = user?.name ?? 'Driver';
  return {
    name,
    email: user?.email ?? '',
    initials: initialsOf(name),
    isDemoDrive: locationSource === 'demo',
    signingOut,
    open: (href) => router.push(href),
    toggleDemoDrive: () =>
      useSettingsStore.getState().setLocationSource(locationSource === 'demo' ? 'gps' : 'demo'),
    signOut,
  };
}
