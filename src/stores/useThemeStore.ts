import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeState {
  preference: ThemePreference;
  setPreference(preference: ThemePreference): void;
}

export function createThemeStore() {
  return create<ThemeState>()(
    persist(
      (set) => ({
        preference: 'system',
        setPreference: (preference) => set({ preference }),
      }),
      {
        name: 'roadsense.theme',
        storage: persistStorage,
      },
    ),
  );
}
