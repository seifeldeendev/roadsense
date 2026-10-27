import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorageFor } from './persistStorage';
import type { Dependencies } from '../data/dependencies';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeState {
  preference: ThemePreference;
  setPreference(preference: ThemePreference): void;
}

export function createThemeStore(deps: Pick<Dependencies, 'storage'>) {
  return create<ThemeState>()(
    persist(
      (set) => ({
        preference: 'system',
        setPreference: (preference) => set({ preference }),
      }),
      {
        name: 'roadsense.theme',
        storage: persistStorageFor(deps.storage),
      },
    ),
  );
}
