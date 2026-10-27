import { useCallback, useState } from 'react';
import { router, type Href } from 'expo-router';
import { useStores } from '@/stores/DependenciesProvider';
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
  const { useSessionStore } = useStores();
  const user = useSessionStore((s) => s.user);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const setLocationSource = useSettingsStore((s) => s.setLocationSource);
  const sessionSignOut = useSessionStore((s) => s.signOut);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = useCallback(() => {
    setSigningOut(true);
    void sessionSignOut().finally(() => setSigningOut(false));
  }, [sessionSignOut]);

  const name = user?.name ?? 'Driver';
  return {
    name,
    email: user?.email ?? '',
    initials: initialsOf(name),
    avatarUri: user?.avatarUri,
    isDemoDrive: locationSource === 'demo',
    signingOut,
    open: (href) => router.push(href),
    toggleDemoDrive: () => setLocationSource(locationSource === 'demo' ? 'gps' : 'demo'),
    signOut,
  };
}
