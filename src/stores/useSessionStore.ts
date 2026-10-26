import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import type { User } from '../domain/entities';
import type { AuthProvider, ProfileChanges } from '../domain/repositories';
import { repositories } from '../data/di';

type SessionState = {
  user: User | null;
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  setHasHydrated(): void;
  completeOnboarding(): void;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signInWithProvider(provider: AuthProvider): Promise<void>;
  updateProfile(changes: ProfileChanges): Promise<void>;
  signOut(): Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
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
      signInWithProvider: async (provider) => {
        const user = await repositories.auth.signInWithProvider(provider);
        set({ user });
      },
      updateProfile: async (changes) => {
        const current = get().user;
        if (current === null) return;
        const user = await repositories.auth.updateProfile(current, changes);
        set({ user });
      },
      signOut: async () => {
        await repositories.auth.signOut();
        set({ user: null });
      },
    }),
    {
      name: 'roadsense.session',
      storage: persistStorage,
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
