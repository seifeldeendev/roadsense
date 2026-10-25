import type { LatLng, TripPoint } from '../domain/entities';
import type { LocationSource } from '../domain/repositories';
import { DEMO_TRIP } from '../data/mock/trips';
import { simulateDrive } from '../domain/usecases/routes/simulateDrive';

let demoRoute: LatLng[] | null = null;

// The Salah Salem demo drive path, reused by the route line and map framing.
export function getDemoRoute(): LatLng[] {
  if (demoRoute === null) {
    demoRoute = DEMO_TRIP.points.map((point) => ({ lat: point.lat, lng: point.lng }));
  }
  return demoRoute;
}

export class MockLocationSource implements LocationSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private onPoint: ((p: TripPoint) => void) | null = null;
  private nextIndex = 0;

  constructor(
    private readonly points: readonly TripPoint[],
    private readonly intervalMs: number = 1000,
    private rate: number = 1,
  ) {}

  start(onPoint: (p: TripPoint) => void): void {
    this.onPoint = onPoint;
    this.nextIndex = 0;
    this.schedule();
  }

  setRate(rate: number): void {
    this.rate = rate;
    if (this.timer !== null) this.schedule();
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.onPoint = null;
  }

  private schedule(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(this.tick, this.intervalMs / this.rate);
  }

  private tick = (): void => {
    if (!this.onPoint) return;
    if (this.nextIndex >= this.points.length) {
      this.stop();
      return;
    }
    this.onPoint(this.points[this.nextIndex]);
    this.nextIndex += 1;
    if (this.nextIndex >= this.points.length) {
      this.stop();
    }
  };
}

let currentRate = 1;
let demoSource: MockLocationSource | null = null;

export function setRate(rate: number): void {
  currentRate = rate;
  demoSource?.setRate(rate);
}

// Route points queued for the next demo location source. Setting a trip makes
// the next createDemoLocationSource() play that trip instead of DEMO_TRIP;
// passing null (or consuming a queued route) restores the demo.
let pendingRoutePoints: TripPoint[] | null = null;
// The route chosen in a planner; a demo drive follows it instead of Salah Salem.
let plannedRoute: LatLng[] | null = null;

// The route Drive Mode is about to play or is playing, published so the map
// can redraw it (subscribe with useSyncExternalStore). Snapshots are stable
// arrays that only change when the route does.
let driveRoute: LatLng[] | null = null;
const driveRouteListeners = new Set<() => void>();

function publishDriveRoute(points: readonly TripPoint[] | null): void {
  driveRoute = points === null ? getDemoRoute() : points.map(({ lat, lng }) => ({ lat, lng }));
  driveRouteListeners.forEach((listener) => listener());
}

export function getDriveRoute(): LatLng[] {
  return driveRoute ?? getDemoRoute();
}

export function subscribeDriveRoute(listener: () => void): () => void {
  driveRouteListeners.add(listener);
  return () => {
    driveRouteListeners.delete(listener);
  };
}

export function setDriveRoutePoints(points: TripPoint[] | null): void {
  pendingRoutePoints = points;
  // A replay replaces any planned route.
  if (points !== null) plannedRoute = null;
  publishDriveRoute(points);
}

// Demo playback, in order of preference: a queued trip replay, a simulated drive
// along the planned route, or the recorded Salah Salem drive.
export function createDemoLocationSource(limitFor: (position: LatLng) => number = () => 0): LocationSource {
  const queued = pendingRoutePoints;
  pendingRoutePoints = null;
  let points: readonly TripPoint[] = queued ?? DEMO_TRIP.points;
  if (queued === null && plannedRoute !== null) {
    points = simulateDrive(plannedRoute, Date.now(), limitFor);
  } else if (queued === null && getDriveRoute() !== getDemoRoute()) {
    publishDriveRoute(null);
  }
  demoSource = new MockLocationSource(points, 1000, currentRate);
  return demoSource;
}

// True while a replayed trip is queued for the next drive (it must use the demo source).
export function hasQueuedReplay(): boolean {
  return pendingRoutePoints !== null;
}

// Shows a planned route (from the route planner) on the Drive map without
// replaying it; null goes back to the demo route.
export function showPlannedRoute(points: LatLng[] | null): void {
  plannedRoute = points;
  driveRoute = points ?? getDemoRoute();
  driveRouteListeners.forEach((listener) => listener());
}
