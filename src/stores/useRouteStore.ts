import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dependencies } from '../data/dependencies';
import type { Destination, LatLng, PlannedRoute } from '../domain/entities';
import { persistStorage } from './persistStorage';

const MAX_RECENT = 5;

export interface RouteState {
  destinations: Destination[];
  recent: Destination[];
  selected: Destination | null;
  route: PlannedRoute | null;
  isLoading: boolean;
  error: string | null;
  loadDestinations(): Promise<void>;
  // Loads destinations unless skip says the current state is good enough.
  loadDestinationsUnless(skip: (state: RouteState) => boolean): Promise<void>;
  selectDestination(destination: Destination, from: LatLng): Promise<void>;
  resetSelection(): void;
}

export function createRouteStore(deps: Pick<Dependencies, 'routes'>) {
  return create<RouteState>()(
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
            const destinations = await deps.routes.getDestinations();
            set({ destinations, isLoading: false });
          } catch (err) {
            set({
              isLoading: false,
              error: err instanceof Error ? err.message : 'Failed to load destinations',
            });
          }
        },
        loadDestinationsUnless: async (skip) => {
          if (!skip(get())) await get().loadDestinations();
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
            const route = await deps.routes.getRoute(destination, from);
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
}
