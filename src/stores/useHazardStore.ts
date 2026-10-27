import { create } from 'zustand';
import type { Dependencies } from '../data/dependencies';
import type { Hazard, HazardType } from '../domain/entities';

export interface HazardState {
  hazards: Hazard[];
  // A load has succeeded at least once (the list may still be empty).
  hasLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  load(): Promise<void>;
  // Loads unless skip says the current state is good enough.
  loadUnless(skip: (state: HazardState) => boolean): Promise<void>;
  report(type: HazardType, lat: number, lng: number, heading: number): Promise<Hazard>;
  vote(id: string, stillThere: boolean): Promise<void>;
  getById(id: string): Hazard | undefined;
}

export function createHazardStore(deps: Pick<Dependencies, 'hazards'>) {
  return create<HazardState>()((set, get) => ({
    hazards: [],
    hasLoaded: false,
    isLoading: false,
    error: null,
    load: async () => {
      set({ isLoading: true, error: null });
      try {
        const hazards = await deps.hazards.getActive();
        set({ hazards, hasLoaded: true, isLoading: false });
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load hazards',
        });
      }
    },
    loadUnless: async (skip) => {
      if (!skip(get())) await get().load();
    },
    report: async (type, lat, lng, heading) => {
      const hazard = await deps.hazards.report({ type, lat, lng, heading });
      set((state) => ({ hazards: [...state.hazards, hazard] }));
      return hazard;
    },
    vote: async (id, stillThere) => {
      const updated = await deps.hazards.vote(id, stillThere);
      set((state) => ({
        hazards: state.hazards.map((h) => (h.id === updated.id ? updated : h)),
      }));
    },
    getById: (id) => get().hazards.find((h) => h.id === id),
  }));
}
