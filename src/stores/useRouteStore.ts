import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { repositories } from '../data/di';
import type { Destination, LatLng, PlannedRoute } from '../domain/entities';
import { persistStorage } from './persistStorage';

const MAX_RECENT = 5;

interface RouteState {
  destinations: Destination[];
  recent: Destination[];
  selected: Destination | null;
  route: PlannedRoute | null;
  isLoading: boolean;
  error: string | null;
  loadDestinations(): Promise<void>;
  selectDestination(destination: Destination, from: LatLng): Promise<void>;
  resetSelection(): void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      destinations: [],
      recent: [],
      selected: null,
      route: null,
      isLoading: false,
      error: null,
      loadDestinations: async () => {
        set({ isLoading: true, error: null });
        try {
          const destinations = await repositories.routes.getDestinations();
          set({ destinations, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load destinations',
          });
        }
      },
      selectDestination: async (destination, from) => {
        set((state) => ({
          selected: destination,
          route: null,
          isLoading: true,
          error: null,
          recent: [destination, ...state.recent.filter((item) => item.id !== destination.id)].slice(0, MAX_RECENT),
        }));
        try {
          const route = await repositories.routes.getRoute(destination, from);
          // Ignore a slower response for a destination the user has already changed.
          if (get().selected?.id !== destination.id) return;
          set({ route, isLoading: false });
        } catch (err) {
          if (get().selected?.id !== destination.id) return;
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load route',
          });
        }
      },
      resetSelection: () => set({ selected: null, route: null, error: null }),
    }),
    {
      name: 'roadsense.routes',
      storage: persistStorage,
      partialize: (state) => ({ recent: state.recent }),
    },
  ),
);
