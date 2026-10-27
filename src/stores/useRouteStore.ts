import { create } from 'zustand';
import { repositories } from '../data/di';
import type { Destination, PlannedRoute } from '../domain/entities';

interface RouteState {
  destinations: Destination[];
  selectedDestinationId: string | null;
  route: PlannedRoute | null;
  isLoading: boolean;
  error: string | null;
  loadDestinations(): Promise<void>;
  selectDestination(id: string): Promise<void>;
  resetSelection(): void;
}

export const useRouteStore = create<RouteState>()((set, get) => ({
  destinations: [],
  selectedDestinationId: null,
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
  selectDestination: async (id) => {
    set({ selectedDestinationId: id, route: null, isLoading: true, error: null });
    try {
      const route = await repositories.routes.getRoute(id);
      // Ignore a slower response for a destination the user has already changed.
      if (get().selectedDestinationId !== id) return;
      set({ route, isLoading: false });
    } catch (err) {
      if (get().selectedDestinationId !== id) return;
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load route',
      });
    }
  },
  resetSelection: () => set({ selectedDestinationId: null, route: null }),
}));
