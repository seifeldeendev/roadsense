import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorageFor } from './persistStorage';
import type { User } from '../domain/entities';
import type { AuthProvider, ProfileChanges } from '../domain/repositories';
import type { Dependencies } from '../data/dependencies';

export type SessionState = {
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

export function createSessionStore(deps: Pick<Dependencies, 'auth' | 'storage'>) {
  const store = create<SessionState>()(
    persist(
      (set, get) => ({
        user: null,
        hasCompletedOnboarding: false,
        hasHydrated: false,
        setHasHydrated: () => set({ hasHydrated: true }),
        completeOnboarding: () => set({ hasCompletedOnboarding: true }),
        signIn: async (email, password) => {
          const user = await deps.auth.signIn(email, password);
          set({ user });
        },
        signUp: async (name, email, password) => {
          const user = await deps.auth.signUp(name, email, password);
          set({ user });
        },
        signInWithProvider: async (provider) => {
          const user = await deps.auth.signInWithProvider(provider);
          set({ user });
        },
        updateProfile: async (changes) => {
          const current = get().user;
          if (current === null) return;
          const user = await deps.auth.updateProfile(current, changes);
          set({ user });
        },
        signOut: async () => {
          await deps.auth.signOut();
          set({ user: null });
        },
      }),
      {
        name: 'roadsense.session',
        storage: persistStorageFor(deps.storage),
        partialize: (state) => ({
          user: state.user,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
        }),
        onRehydrateStorage: () => () => {
          store.getState().setHasHydrated();
        },
      },
    ),
  );
  return store;
}
