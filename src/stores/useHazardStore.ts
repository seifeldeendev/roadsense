import { create } from 'zustand';
import { repositories } from '../data/di';
import type { Camera, Hazard, HazardType } from '../domain/entities';

interface HazardState {
  cameras: Camera[];
  hazards: Hazard[];
  isLoading: boolean;
  error: string | null;
  load(): Promise<void>;
  report(type: HazardType, lat: number, lng: number, heading: number): Promise<Hazard>;
  vote(id: string, stillThere: boolean): Promise<void>;
  getById(id: string): Hazard | undefined;
}

export const useHazardStore = create<HazardState>()((set, get) => ({
  cameras: [],
  hazards: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [cameras, hazards] = await Promise.all([
        repositories.cameras.getAll(),
        repositories.hazards.getActive(),
      ]);
      set({ cameras, hazards, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load hazards',
      });
    }
  },
  report: async (type, lat, lng, heading) => {
    const hazard = await repositories.hazards.report({ type, lat, lng, heading });
    set((state) => ({ hazards: [...state.hazards, hazard] }));
    return hazard;
  },
  vote: async (id, stillThere) => {
    const updated = await repositories.hazards.vote(id, stillThere);
    set((state) => ({
      hazards: state.hazards.map((h) => (h.id === updated.id ? updated : h)),
    }));
  },
  getById: (id) => get().hazards.find((h) => h.id === id),
}));
