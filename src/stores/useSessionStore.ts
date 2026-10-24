import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../domain/entities';
import { repositories } from '../data/di';

type SessionState = {
  user: User | null;
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  setHasHydrated(): void;
  completeOnboarding(): void;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      hasCompletedOnboarding: false,
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      signIn: async (email, password) => {
        const user = await repositories.auth.signIn(email, password);
        set({ user });
      },
      signUp: async (name, email, password) => {
        const user = await repositories.auth.signUp(name, email, password);
        set({ user });
      },
      signOut: async () => {
        await repositories.auth.signOut();
        set({ user: null });
      },
    }),
    {
      name: 'roadsense.session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => () => {
        useSessionStore.getState().setHasHydrated();
      },
    },
  ),
);
