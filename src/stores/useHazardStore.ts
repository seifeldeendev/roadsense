import { create } from 'zustand';
import { productionDependencies, type Dependencies } from '../data/dependencies';
import type { Camera, Hazard, HazardType } from '../domain/entities';

export interface HazardState {
  cameras: Camera[];
  hazards: Hazard[];
  isLoading: boolean;
  error: string | null;
  load(): Promise<void>;
  // Loads unless skip says the current state is good enough.
  loadUnless(skip: (state: HazardState) => boolean): Promise<void>;
  report(type: HazardType, lat: number, lng: number, heading: number): Promise<Hazard>;
  vote(id: string, stillThere: boolean): Promise<void>;
  getById(id: string): Hazard | undefined;
}

export function createHazardStore(deps: Pick<Dependencies, 'cameras' | 'hazards'>) {
  return create<HazardState>()((set, get) => ({
    cameras: [],
    hazards: [],
    isLoading: false,
    error: null,
    load: async () => {
      set({ isLoading: true, error: null });
      try {
        const [cameras, hazards] = await Promise.all([
          deps.cameras.getAll(),
          deps.hazards.getActive(),
        ]);
        set({ cameras, hazards, isLoading: false });
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

export const useHazardStore = createHazardStore(productionDependencies);
