import { useCallback, useState } from 'react';
import { router, type Href } from 'expo-router';
import { useSessionStore } from '@/stores/useSessionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { initialsOf } from './initials';

export type AccountViewModel = {
  name: string;
  email: string;
  initials: string;
  avatarUri: string | undefined;
  isDemoDrive: boolean;
  signingOut: boolean;
  open: (href: Href) => void;
  toggleDemoDrive: () => void;
  signOut: () => void;
};

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
    avatarUri: user?.avatarUri,
    isDemoDrive: locationSource === 'demo',
    signingOut,
    open: (href) => router.push(href),
    toggleDemoDrive: () =>
      useSettingsStore.getState().setLocationSource(locationSource === 'demo' ? 'gps' : 'demo'),
    signOut,
  };
}
