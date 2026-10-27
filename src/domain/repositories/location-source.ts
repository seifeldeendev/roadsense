import type { LatLng, TripPoint } from '../entities';

export type Unsubscribe = () => void;

export interface LocationSource {
  // One fix right now; null when unavailable or not permitted.
  getCurrent(): Promise<LatLng | null>;
  // Streams trip points until the returned function is called.
  watch(onPoint: (p: TripPoint) => void): Unsubscribe;
}

// What the next demo drive plays, in order of preference: a queued trip replay,
// a simulated drive along the planned route, or the recorded demo drive.
export type DemoPlayback =
  | { kind: 'replay'; points: readonly TripPoint[] }
  | { kind: 'planned'; route: readonly LatLng[] }
  | { kind: 'demo' };
