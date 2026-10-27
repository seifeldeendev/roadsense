import { create } from 'zustand';
import type { Trip } from '../domain/entities';
import { productionDependencies, type Dependencies } from '../data/dependencies';

export type ReplayRate = 1 | 2 | 4;

export type ReplayState = {
  tripId: string | null;
  isPlaying: boolean;
  rate: ReplayRate;
  index: number;
};

export interface TripState {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  load(): Promise<void>;
  // Loads unless skip says the current state is good enough.
  loadUnless(skip: (state: TripState) => boolean): Promise<void>;
  replay: ReplayState;
  selectReplayTrip(tripId: string | null): void;
  play(): void;
  pause(): void;
  setRate(rate: ReplayRate): void;
  seek(index: number): void;
  tick(): void;
}

const initialReplay: ReplayState = {
  tripId: null,
  isPlaying: false,
  rate: 1,
  index: 0,
};

export function createTripStore(deps: Pick<Dependencies, 'trips'>) {
  return create<TripState>()((set, get) => ({
    trips: [],
    isLoading: false,
    error: null,
    load: async () => {
      set({ isLoading: true, error: null });
      try {
        const trips = await deps.trips.list();
        set({ trips, isLoading: false });
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load trips',
        });
      }
    },
    loadUnless: async (skip) => {
      if (!skip(get())) await get().load();
    },
    replay: initialReplay,
    selectReplayTrip: (tripId) =>
      set({ replay: { ...get().replay, tripId, isPlaying: false, index: 0 } }),
    play: () => {
      const { replay, trips } = get();
      if (replay.tripId === null) return;
      const trip = trips.find((candidate) => candidate.id === replay.tripId);
      const lastIndex = trip === undefined ? 0 : trip.points.length - 1;
      // Pressing play at the end restarts the trip from the beginning.
      const index = replay.index >= lastIndex ? 0 : replay.index;
      set({ replay: { ...replay, isPlaying: true, index } });
    },
    pause: () => set({ replay: { ...get().replay, isPlaying: false } }),
    setRate: (rate) => set({ replay: { ...get().replay, rate } }),
    seek: (index) => {
      const { replay, trips } = get();
      const trip =
        replay.tripId === null ? undefined : trips.find((candidate) => candidate.id === replay.tripId);
      const lastIndex = trip === undefined ? index : trip.points.length - 1;
      set({
        replay: { ...replay, index: Math.min(Math.max(0, index), lastIndex) },
      });
    },
    tick: () => {
      const { replay, trips } = get();
      if (!replay.isPlaying || replay.tripId === null) return;
      const trip = trips.find((candidate) => candidate.id === replay.tripId);
      if (trip === undefined || trip.points.length === 0) {
        set({ replay: { ...replay, isPlaying: false } });
        return;
      }
      if (replay.index >= trip.points.length - 1) {
        set({ replay: { ...replay, isPlaying: false } });
        return;
      }
      set({ replay: { ...replay, index: replay.index + 1 } });
    },
  }));
}

export const useTripStore = createTripStore(productionDependencies);
