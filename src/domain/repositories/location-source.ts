import type { LatLng, TripPoint } from '../entities';

export type Unsubscribe = () => void;

export interface LocationSource {
  // One fix right now; null when unavailable or not permitted.
  getCurrent(): Promise<LatLng | null>;
  // Streams trip points until the returned function is called. onError is told
  // when the stream fails to start or the platform reports it broken (location
  // turned off, permission revoked); a stream that just goes quiet is not
  // reported, so callers watch for stale readings themselves.
  watch(onPoint: (p: TripPoint) => void, onError?: (reason: string) => void): Unsubscribe;
}

// What the next demo drive plays, in order of preference: a queued trip replay,
// a simulated drive along the planned route, or the recorded demo drive.
export type DemoPlayback =
  | { kind: 'replay'; points: readonly TripPoint[] }
  | { kind: 'planned'; route: readonly LatLng[] }
  | { kind: 'demo' };

// Builds the location sources a drive can play from. The device knows nothing
// about speed limits, so the caller supplies them for each position.
export interface LocationSources {
  // The recorded demo drive path, also the start point when there is no fix.
  demoRoute: LatLng[];
  // Asks for foreground location access; false when refused or unavailable.
  requestPermission(): Promise<boolean>;
  // One fix of the phone's position; null when unavailable or not permitted.
  currentPosition(): Promise<LatLng | null>;
  device(limitFor: (position: LatLng) => number): LocationSource;
  demo(playback: DemoPlayback, limitFor: (position: LatLng) => number): LocationSource;
}
